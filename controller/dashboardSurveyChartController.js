const prisma = require("../prisma/client")

const getPie = async (req, res) => {

    let body_topikId = 1
    let body_title = "Status Kepemilikan Lahan"
    let body_name_input = "question2"
    

    let caseWhen = body_name_input + '-Comment'
    let name_inputLike = `%${body_name_input}%`
    let params = [body_topikId, body_title, name_inputLike, caseWhen]


    let resultPie = await prisma.$queryRawUnsafe(`select x.topik, x.title, x.value, count(x.value), x.chart from (
                select
                    tp.topik, dr.title,
                    case 
                        WHEN dr.name_input = $4 THEN 'lainnya'
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
                where r.topik_id = $1 and dr.title = $2 and dr.name_input ilike $3
            ) as x
            group by x.topik, x.title, x.value, x.chart`,...params)



    const outputPie = {
        "topik": resultPie[0]?.topik,
        "typChart": "pie",
        "title": resultPie[0]?.title,
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
        data: outputPie,

    }, replacer)));
}

const getBar = async (req, res) => {

    let body_topikId = 1
    let body_title = "Jenis lahan yang digunakan untuk padi"
    let body_name_input = "question4"
    
    let caseWhen = body_name_input + '-Comment'
    let name_inputLike = `%${body_name_input}%`

    let params = [body_topikId, body_title, name_inputLike, caseWhen]


    let resultBar = await prisma.$queryRawUnsafe(`select x.topik, x.title, x.value, count(x.value), x.chart, x.year from (
        select
            tp.topik,
            dr.title,
            case 
                WHEN dr.name_input = $4 THEN 'Lainnya'
                else dr.value 
            end as value,
            case 
                when dr.title = $2 then 'bar'
            end as chart,
            dr.name_input, dr."type",
            EXTRACT(YEAR FROM r.created_at) as year
        from responden r
            inner join topik tp on tp.id = r.topik_id
            inner join provinsi p on p.provinsi_id  = r.provinsi_id 
            inner join kabupaten_kota kk on kk.kabkota_id = r.kabkota_id 
            inner join detail_responden dr on r.id  = dr.responden_id 
        where r.topik_id = $1 and dr.title = $2 and dr.name_input ilike $3
    ) as x
        group by x.topik, x.title, x.value, x.chart, x.year`, ...params)



    function replacer(key, value) {
        if (typeof value === 'bigint') {
            return value.toString();  // Convert BigInt to a string
        }
        return value;
    }

    res.json(JSON.parse(JSON.stringify({
        data: resultBar,
    }, replacer)));
}

const getWorldCloud = async (req, res) => {

    let body_topikId = 1
    let body_name_input = "question6"
    
    let name_inputLike = `%${body_name_input}%`
    let params = [body_topikId, name_inputLike]

    let result = await prisma.$queryRawUnsafe(`select
                    dr.value as text, 
                    count(dr.id) as value 
                from responden r
                    left join provinsi p on p.provinsi_id  = r.provinsi_id 
                    left join kabupaten_kota kk on kk.kabkota_id = r.kabkota_id 
                    left join detail_responden dr on r.id  = dr.responden_id 
                where r.topik_id = $1 and name_input ilike $2 
                group by dr.value`, ...params)

    function replacer(key, value) {
        if (typeof value === 'bigint') {
            return value.toString();  // Convert BigInt to a string
        }
        return value;
    }

    res.json(JSON.parse(JSON.stringify({
        data: result,
    }, replacer)));
}

const getLineChart = async (req, res) => {



    let body_topikId = 1
    let body_title = "Apakah ada peningkatan atau penurunan  produktivitas dibanding tahun sebelumnya?"
    let body_name_input = "question5"
    
    let caseWhenMeningkat = body_name_input + '-Inputopsi-ya_meningkat'
    let caseWhenMenurun = body_name_input + '-Inputopsi-ya_menurun'
    let name_inputLike = `%${body_name_input}%`

    let params = [body_topikId, body_title, name_inputLike, caseWhenMeningkat, caseWhenMenurun]

    let result = await prisma.$queryRawUnsafe(`select
                        sum(value),
                        EXTRACT(YEAR FROM x.created_at) AS year
                    from (
                        select 
                            case 
                                WHEN dr.value ~ '^[a-zA-Z]+$' THEN 0
                                when name_input = $4 then CAST(dr.value AS INT)  
                                when name_input = $5 then CAST(dr.value AS INT) * -1
                            end as value,
                            r.created_at
                        from responden r
                        inner join detail_responden dr on r.id = dr.responden_id
                        where r.topik_id = $1 and  dr.title = $2 and dr.name_input ilike $3
                    ) as x
                    group by EXTRACT(YEAR FROM x.created_at)`, ...params)

    function replacer(key, value) {
        if (typeof value === 'bigint') {
            return value.toString();  // Convert BigInt to a string
        }
        return value;
    }

    res.json(JSON.parse(JSON.stringify({
        data: result,
    }, replacer)));

}

module.exports = { getPie, getBar, getWorldCloud, getLineChart }