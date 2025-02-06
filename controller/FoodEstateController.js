

const prisma = require("../prisma/client")

const getChart = async (req, res) => {

    const { sub_kategori } = req.query

    if (sub_kategori == undefined) {
        return res.status(404).json({
            success: false,
            message: "paramter not found"
        })
    }

    try {
        let subCategory = 'Jagung'
        let result = await prisma.$queryRaw`SELECT
                    EXTRACT(YEAR FROM tanggal_data) AS year, 
                    sum(value) as value,
                    sd.nama_subdata,
                    sk.nama_sub_kategori
                from "data" d 
                inner join subdata sd on d.subdata_id = sd.id 
                inner join sub_kategori sk on d.sub_kategori_id = sk.id 
                where 
                    sd.nama_subdata in  ('Produktivitas','Luas Panen')
                    and sk.nama_sub_kategori = ${sub_kategori}
                group by EXTRACT(YEAR FROM tanggal_data),
                    sd.nama_subdata,
                    sk.nama_sub_kategori
                order by year desc`

        let data = {
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

    } catch (error) {
        logger.error(`Error ${error.message}`)
        res.status(500).send({
            success: false,
            message: error.message,
        });
    }

}


module.exports = { getChart }

