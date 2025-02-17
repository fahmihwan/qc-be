const prisma = require("../prisma/client")

const getSlider = async (req, res) => {

    const result = await prisma.$queryRaw`select x.nama_sub_kategori, x.nama_kategori, 
                    SUM(x.penyebab) AS penyebab, 
                    SUM(x.meninggal) AS meninggal, 
                    SUM(x.hilang) AS hilang,
                    SUM(x.terluka) AS terluka,
                    SUM(x.rumahrusak) AS rumahrusak,
                    SUM(x.rumahterendam) AS rumahterendam,
                    SUM(x.fasumrusak) AS fasumrusak,
                    SUM(x.luaspanen) AS luaspanen,
                    SUM(x.produktivitas) AS produktivitas,
                    SUM(x.produksi) AS produksi,
                    SUM(x.kerawananpangan) AS kerawananpangan
                from (
                    select 
                        sk.nama_sub_kategori,
                        sk.nama_kategori,
                        case when sd.id = 1 then COALESCE(d.value, 0) else 0 end as penyebab,
                        case when sd.id = 2 then COALESCE(d.value, 0) else 0 end as meninggal,
                        case when sd.id = 3 then COALESCE(d.value, 0) else 0 end as hilang,
                        case when sd.id = 4 then COALESCE(d.value, 0) else 0 end as terluka,
                        case when sd.id = 5 then COALESCE(d.value, 0) else 0 end as rumahrusak,
                        case when sd.id = 6 then COALESCE(d.value, 0) else 0 end as rumahterendam,
                        case when sd.id = 7 then COALESCE(d.value, 0) else 0 end as fasumrusak,
                        case when sd.id = 8 then COALESCE(d.value, 0) else 0 end as luaspanen,
                        case when sd.id = 9 then COALESCE(d.value, 0) else 0 end as produktivitas,
                        case when sd.id = 10 then COALESCE(d.value, 0) else 0 end as produksi,
                        case when sd.id = 15 then COALESCE(d.value, 0) else 0 end as kerawananpangan
                    from sub_kategori sk
                    left join data d on sk.id = d.sub_kategori_id
                    left join subdata sd on sd.id = d.subdata_id 
                ) as x
                group by x.nama_sub_kategori, x.nama_kategori`


    let data = []
    for (let i = 0; i < result.length; i++) {
        const d = result[i];
        if (d.nama_kategori == 'Food Estate') {
            data.push({
                title: d.nama_sub_kategori,
                data: {
                    luasPanen: d.luaspanen,
                    produktivitas: d.produktivitas,
                    produksi: d.produksi
                }
            })
        } else if (d.nama_kategori == 'Bencana') {
            data.push({
                title: d.nama_sub_kategori,
                data: {
                    meninggal: d.meninggal,
                    hilang: d.hilang,
                    menderitaDanMengungsi: null,
                    lukaLuka: d.terluka
                }
            })
        }
    }

    res.status(200).send({
        data: data
    })
}


const getTable = async (req, res) => {

    let { year } = req.query
    if (year == undefined) {
        year = await prisma.$queryRaw`select EXTRACT(YEAR FROM d.tanggal_data) as year from data d order by EXTRACT(YEAR FROM d.tanggal_data) desc limit 1`;
        year = year[0]?.year
    }

    const result = await prisma.$queryRawUnsafe(`select y.id, y.nama_kategori, y.nama_sub_kategori, COALESCE(sum(y.value), 0) as total, 'ha' as satuan, 'Luas Panen' as nama_subdata   from (
        select sk2.id, sk2.nama_kategori, sk2.nama_sub_kategori, x.year, 
        x.value from sub_kategori sk2
        left join (
            select d.*, EXTRACT(YEAR FROM d.tanggal_data) as year from "data" d 
            inner join sub_kategori sk on d.sub_kategori_id = sk.id
            where d.subdata_id = 8 --Luas Panen
            and d.satuan_id = 2 -- ha
            and EXTRACT(YEAR FROM d.tanggal_data) = $1 
            and sk.nama_kategori = 'Food Estate'
        ) as x on x.sub_kategori_id = sk2.id
        where sk2.nama_kategori = 'Food Estate'
    ) as y
    group by y.id, y.nama_kategori,y.nama_sub_kategori
    union all
    select y.id, y.nama_kategori, y.nama_sub_kategori, COALESCE(sum(y.value), 0) as total, 'ku/ha' as satuan, 'Produktivitas' as nama_subdata   from (
        select sk2.id, sk2.nama_kategori, sk2.nama_sub_kategori, x.year, 
        x.value from sub_kategori sk2
        left join (
            select d.*, EXTRACT(YEAR FROM d.tanggal_data) as year from "data" d 
            inner join sub_kategori sk on d.sub_kategori_id = sk.id
            where d.subdata_id = 9 --Produktivitas
            and d.satuan_id = 4 -- ku/ha
            and EXTRACT(YEAR FROM d.tanggal_data) = $1
            and sk.nama_kategori = 'Food Estate'
        ) as x on x.sub_kategori_id = sk2.id
        where sk2.nama_kategori = 'Food Estate'
    ) as y
    group by y.id, y.nama_kategori,y.nama_sub_kategori`, Number(year))

    res.status(200).send({
        data: result
    })
}



const getPieChart = async (req, res) => {
    let { year, provinsi_id } = req.query

    if (year == undefined) {
        year = await prisma.$queryRaw`select EXTRACT(YEAR FROM d.tanggal_data) as year from data d order by EXTRACT(YEAR FROM d.tanggal_data) desc limit 1`;
        year = year[0]?.year
    }

    const rData = await prisma.$queryRawUnsafe(`select y.id, y.nama_kategori, y.nama_sub_kategori, COALESCE(sum(y.value), 0) as total, 'ha' as satuan, 'Luas Panen' as nama_subdata   from (
        select sk2.id, sk2.nama_kategori, sk2.nama_sub_kategori, x.year, 
        x.value from sub_kategori sk2
        left join (
            select d.*, EXTRACT(YEAR FROM d.tanggal_data) as year from "data" d 
            inner join sub_kategori sk on d.sub_kategori_id = sk.id
            where d.subdata_id = 8 --Luas Panen
            and d.satuan_id = 2 -- ha
            and EXTRACT(YEAR FROM d.tanggal_data) = $1 
            and d.provinsi_id = $2
            and sk.nama_kategori = 'Food Estate'
        ) as x on x.sub_kategori_id = sk2.id
        where sk2.nama_kategori = 'Food Estate'
    ) as y
    group by y.id, y.nama_kategori,y.nama_sub_kategori
    union all
    select y.id, y.nama_kategori, y.nama_sub_kategori, COALESCE(sum(y.value), 0) as total, 'ku/ha' as satuan, 'Produktivitas' as nama_subdata   from (
        select sk2.id, sk2.nama_kategori, sk2.nama_sub_kategori, x.year, 
        x.value from sub_kategori sk2
        left join (
            select d.*, EXTRACT(YEAR FROM d.tanggal_data) as year from "data" d 
            inner join sub_kategori sk on d.sub_kategori_id = sk.id
            where d.subdata_id = 9 --Produktivitas
            and d.satuan_id = 4 -- ku/ha
            and EXTRACT(YEAR FROM d.tanggal_data) = $1
            and d.provinsi_id = $2
            and sk.nama_kategori = 'Food Estate'
        ) as x on x.sub_kategori_id = sk2.id
        where sk2.nama_kategori = 'Food Estate'
    ) as y     
    group by y.id, y.nama_kategori,y.nama_sub_kategori`, Number(year), Number(provinsi_id))


    let rMapping = await prisma.$queryRaw`SELECT * FROM sub_kategori sk where sk.nama_kategori = 'Food Estate'`
    let result = []

    for (let i = 0; i < rData.length; i++) {

        // buat schema obj
        let schemaObj = {
            year: rData[i].year,
            luas_panen: {},
            produktivitas: {}
        }


        // mapping master untuk produktifitas & Luas panen
        for (let j = 0; j < rMapping.length; j++) {
            schemaObj.luas_panen[rMapping[j].nama_sub_kategori] = 0;
            schemaObj.produktivitas[rMapping[j].nama_sub_kategori] = 0

            // masukan data pertama
            if (result.length == 0) {
                if (rData[i]?.nama_subdata == 'Produktivitas') {
                    schemaObj.produktivitas[rData[i]?.nama_sub_kategori] = rData[i].total
                } else if (rData[i]?.nama_subdata == 'Luas Panen') {
                    schemaObj.luas_panen[rData[i]?.nama_sub_kategori] = rData[i].total
                }
                result.push(schemaObj)


                // masukan data selanjutnya
            } else {

                // ambil index dari hasil akhir
                // const getIndexResult = result.findIndex((d) => d.year == rData[i].year)

                let getIndexResult = -1;
                for (let v = 0; v < result.length; v++) {
                    if (result[v].year === rData[i].year) {
                        getIndexResult = v;
                        break; // Keluar dari loop setelah menemukan indeks pertama
                    }
                }


                // kalau ada data berdasarkan tahun
                if (getIndexResult >= 0) {
                    let mapData = result[getIndexResult]
                    if (rData[i].nama_subdata == "Luas Panen") {
                        mapData.luas_panen[rData[i]?.nama_sub_kategori] = rData[i].total
                    } else if (rData[i].nama_subdata == "Produktivitas") {
                        mapData.produktivitas[rData[i]?.nama_sub_kategori] = rData[i].total
                    }

                    // kalau tidak ada data berdasarkan tahun. tambahkan array lagi 
                } else {
                    if (rData[i]?.nama_subdata == 'Produktivitas') {
                        schemaObj.produktivitas[rData[i]?.nama_sub_kategori] = rData[i].total
                    } else if (rData[i]?.nama_subdata == 'Luas Panen') {
                        schemaObj.luas_panen[rData[i]?.nama_sub_kategori] = rData[i].total
                    }
                    result.push(schemaObj)
                }
            }
        }


    }

    const result2 = result.reduce((acc, item) => {
        if (!acc[item.year]) {
            acc[item.year] = {
                year: item.year,
                luas_panen: {},
                produktivitas: {}
            };
        }

        for (let key in item.luas_panen) {
            acc[item.year].luas_panen[key] = acc[item.year].luas_panen[key]
                ? parseFloat(acc[item.year].luas_panen[key]) + parseFloat(item.luas_panen[key])
                : parseFloat(item.luas_panen[key]);
        }

        for (let key in item.produktivitas) {
            acc[item.year].produktivitas[key] = acc[item.year].produktivitas[key]
                ? parseFloat(acc[item.year].produktivitas[key]) + parseFloat(item.produktivitas[key])
                : parseFloat(item.produktivitas[key]);
        }

        return acc;
    }, {});

    const output = Object.values(result2);


    res.status(200).send({
        data: output
    })
}

const getListYear = async (req, res) => {
    const result = await prisma.$queryRaw`SELECT EXTRACT(YEAR FROM d.tanggal_data) as year FROM data d GROUP BY EXTRACT(YEAR FROM d.tanggal_data) ORDER BY EXTRACT(YEAR FROM d.tanggal_data) DESC`
    res.status(200).send({
        data: result
    })
}

const getTotalDataListProvinsi = async (req, res) => {
    let { year, subkategori } = req.query

    if (year == undefined) {
        year = await prisma.$queryRaw`select EXTRACT(YEAR FROM d.tanggal_data) as year from data d order by EXTRACT(YEAR FROM d.tanggal_data) desc limit 1`;
        year = year[0]?.year
    }

    let params = [Number(year)]
    let whereClause = ''
    if (subkategori != undefined) {
        whereClause = `and sk.nama_sub_kategori = $2`
        params.push(subkategori)
    }

    const result = await prisma.$queryRawUnsafe(`select xp.nama_provinsi, 
		sum(x.luas_panen) as luas_panen, 
		sum(x.produktivitas) as produktivitas  
            from (
            select d.id,
                d.provinsi_id, 
                case 
                    when d.subdata_id = 8 then COALESCE(d.value, 0)
                    else 0
                end as luas_panen,
                case 
                    when d.subdata_id = 9 then COALESCE(d.value, 0)
                    else 0
                end as produktivitas
                from data d  
                inner join sub_kategori sk on sk.id = d.sub_kategori_id
            where d.subdata_id = 8 or d.subdata_id = 9 
            and EXTRACT(YEAR FROM d.tanggal_data) = $1
            ${whereClause}
        ) as x
        right join provinsi xp on xp.provinsi_id = x.provinsi_id 
        group by xp.nama_provinsi`, ...params)

    res.status(200).send({
        data: result
    })
}

module.exports = { getSlider, getTable, getPieChart, getListYear, getTotalDataListProvinsi }
