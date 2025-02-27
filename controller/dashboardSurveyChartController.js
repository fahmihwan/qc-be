const prisma = require("../prisma/client")

const getPie = async (req, res) => {
    let resultPie = await prisma.$queryRawUnsafe(`select x.topik, x.title, x.value, count(x.value), x.chart from (
                select
                    tp.topik, dr.title,
                    case 
                        WHEN dr.name_input = 'question2-Comment' THEN 'lainnya'
                        else dr.value 
                    end as value,
                    case 
                        when dr.title = 'Status Kepemilikan Lahan' then 'pie'
                    end as chart,
                    dr.name_input, dr."type" 
                from responden r
                    inner join topik tp on tp.id = r.topik_id
                    inner join provinsi p on p.provinsi_id  = r.provinsi_id 
                    inner join kabupaten_kota kk on kk.kabkota_id = r.kabkota_id 
                    inner join detail_responden dr on r.id  = dr.responden_id 
                where r.topik_id = 3 and dr.title ='Status Kepemilikan Lahan' and dr.name_input ilike '%question2%'
            ) as x
            group by x.topik, x.title, x.value, x.chart`)


    const outputPie = {
        "topik": resultPie[0].topik,
        "typChart": "pie",
        "title": resultPie[0].title,
        "labels": [],
        "data": []
    };
    resultPie.forEach(item => {
        outputPie.labels.push(item.value);
        outputPie.data.push(item.count);
    });


    function replacer(key, value) {
        if (typeof value === 'bigint') {
            return value.toString();  // Convert BigInt to a string
        }
        return value;
    }

    res.json(JSON.parse(JSON.stringify({
        pie: outputPie,
        // bar: outputBar
    }, replacer)));
}

const getBar = async (req, res) => {


    let resultBar = await prisma.$queryRawUnsafe(`select x.topik, x.title, x.value, count(x.value), x.chart, x.year from (
        select
            tp.topik,
            dr.title,
            case 
                WHEN dr.name_input = 'question4-Comment' THEN 'lainnya'
                else dr.value 
            end as value,
            case 
                when dr.title = 'Jenis lahan yang digunakan untuk tebu' then 'bar'
            end as chart,
            dr.name_input, dr."type",
            EXTRACT(YEAR FROM r.created_at) as year
        from responden r
            inner join topik tp on tp.id = r.topik_id
            inner join provinsi p on p.provinsi_id  = r.provinsi_id 
            inner join kabupaten_kota kk on kk.kabkota_id = r.kabkota_id 
            inner join detail_responden dr on r.id  = dr.responden_id 
        where r.topik_id = 3 and dr.title ='Jenis lahan yang digunakan untuk tebu' and dr.name_input ilike '%question4%'
    ) as x
        group by x.topik, x.title, x.value, x.chart, x.year`)



    function replacer(key, value) {
        if (typeof value === 'bigint') {
            return value.toString();  // Convert BigInt to a string
        }
        return value;
    }

    res.json(JSON.parse(JSON.stringify({
        pie: resultBar,
        // bar: outputBar
    }, replacer)));


    // let outputBar = {
    //     "topik": resultBar[0].topik,
    //     "typChart": "bar",
    //     "title": resultBar[0].title,
    //     "labels": [],
    //     "data": [],
    //     "year": []
    // }



    // for (let i = 0; i < resultBar.length; i++) {
    //     outputBar.data.push(resultBar[i].count)
    //     outputBar.labels.push(resultBar[i].value)

    //     let found = false
    //     for (let x = 0; x < outputBar.year.length; x++) {
    //         if (outputBar.year[x] == resultBar[i].year) {
    //             found = true;
    //             break;
    //         }
    //     }

    //     if (!found) {
    //         outputBar.year.push(resultBar[i].year)
    //     }
    // }




}

module.exports = { getPie, getBar }