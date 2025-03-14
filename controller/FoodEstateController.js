

const { selectFields } = require("express-validator/lib/field-selection")
const prisma = require("../prisma/client")

const getChart = async (req, res) => {

    let { sub_kategori, provinsi_id } = req.query

    if (sub_kategori == undefined) {
        return res.status(404).json({
            success: false,
            message: "paramter not found"
        })
    }


    try {

        if (sub_kategori == 'All') {
            let rData = await prisma.$queryRaw`SELECT
                        EXTRACT(YEAR FROM tanggal_data) AS year, 
                        sum(value) as value,
                        sd.nama_subdata,
                        sk.nama_sub_kategori
                    from "data" d 
                    inner join subdata sd on d.subdata_id = sd.id 
                    inner join sub_kategori sk on d.sub_kategori_id = sk.id 
                    where 
                        sd.nama_subdata in  ('Produktivitas','Luas Panen') and d.satuan_id in (4,2)
                        and sk.nama_sub_kategori not in ('Batas Hutan')
                    group by EXTRACT(YEAR FROM tanggal_data),
                        sd.nama_subdata,
                        sk.nama_sub_kategori
                    order by year desc`

            let rMapping = await prisma.$queryRaw`SELECT * FROM sub_kategori sk where sk.nama_kategori = 'Food Estate' and sk.nama_sub_kategori not in ('Batas Hutan')`


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
                }


                // masukan data pertama
                if (result.length == 0) {
                    if (rData[i]?.nama_subdata == 'Produktivitas') {
                        schemaObj.produktivitas[rData[i]?.nama_sub_kategori] = rData[i].value
                    } else if (rData[i]?.nama_subdata == 'Luas Panen') {
                        schemaObj.luas_panen[rData[i]?.nama_sub_kategori] = rData[i].value
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
                            mapData.luas_panen[rData[i]?.nama_sub_kategori] = rData[i].value
                        } else if (rData[i].nama_subdata == "Produktivitas") {
                            mapData.produktivitas[rData[i]?.nama_sub_kategori] = rData[i].value
                        }

                        // kalau tidak ada data berdasarkan tahun. tambahkan array lagi 
                    } else {
                        if (rData[i]?.nama_subdata == 'Produktivitas') {
                            schemaObj.produktivitas[rData[i]?.nama_sub_kategori] = rData[i].value
                        } else if (rData[i]?.nama_subdata == 'Luas Panen') {
                            schemaObj.luas_panen[rData[i]?.nama_sub_kategori] = rData[i].value
                        }
                        result.push(schemaObj)
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

        } else {


            let params = [sub_kategori]

            let whereClause = ''
            if (provinsi_id != undefined) {
                whereClause += `and d.provinsi_id = $2`;
                params.push(Number(provinsi_id))
            }
            console.log(params);
            console.log(whereClause);



            let data = null
            let result = []
            result = await prisma.$queryRawUnsafe(`SELECT
                    EXTRACT(YEAR FROM tanggal_data) AS year, 
                    CASE
                        WHEN sd.nama_subdata = 'Produktivitas' THEN AVG(value)
                        WHEN sd.nama_subdata = 'Luas Panen' THEN SUM(value)
                    END as value,
                    sd.nama_subdata,
                    sk.nama_sub_kategori
                from "data" d 
                inner join subdata sd on d.subdata_id = sd.id 
                inner join sub_kategori sk on d.sub_kategori_id = sk.id 
                where 
                    sd.nama_subdata in  ('Produktivitas','Luas Panen') and d.satuan_id in (4,2)
                    and sk.nama_sub_kategori = $1 
                    ${whereClause}
                group by EXTRACT(YEAR FROM tanggal_data),
                    sd.nama_subdata,
                    sk.nama_sub_kategori
                order by year desc`, ...params)

            data = {
                produktivitas: [],
                luasPanen: []
            }

            for (let i = 0; i < result.length; i++) {
                if (result[i].nama_subdata == 'Produktivitas') {
                    data.produktivitas.push(result[i])
                } else if (result[i].nama_subdata == 'Luas Panen') {
                    data.luasPanen.push(result[i])
                }
            }


            res.status(200).send({
                data: data
            })

        }




        // res.status(200).send({
        //     data: data
        // })

    } catch (error) {
        // logger.error(`Error ${error.message}`)
        res.status(500).send({
            success: false,
            message: error.message,
        });
    }

}



module.exports = { getChart }

