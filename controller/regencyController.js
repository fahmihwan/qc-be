const prisma = require("../prisma/client");

const { v4: uuidv4 } = require('uuid');


const getProvinsi = async (req, res) => {
    const result = await prisma.$queryRawUnsafe(`select * from provinsi`)

    res.status(200).send({
        data: result
    })
}


const getKabupaten = async (req, res) => {

    const { provinsi_id } = req.params;
    const result = await prisma.$queryRawUnsafe(`select * from kabupaten_kota kk where provinsi_id = $1`, Number(provinsi_id))

    res.status(200).send({
        data: result
    })
}



const getKecamatan = async (req, res) => {
    const { kabkota_id } = req.params;
    const result = await prisma.$queryRawUnsafe(`select * from kecamatan k where kabkota_id = $1`, Number(kabkota_id))

    res.status(200).send({
        data: result
    })
}

module.exports = { getProvinsi, getKabupaten, getKecamatan }