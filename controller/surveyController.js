const prisma = require("../prisma/client");
const { generateYMDHIS } = require("../utils/generateUtil");
const { v4: uuidv4 } = require('uuid');
const escapeHtml = require('html-escape');
const logger = require('../config/logging')



const storeSurveyDinamis = async (req, res) => {

    // typeinput : text, radiogroup, boolean, checkbox, dropdown, tagbox
    let data = req.body.data
    let informasi_lokasi = req.body.informasi_lokasi

    logger.debug(req.body.informasi_lokasi.provinsi_id)
    logger.debug(req.body.informasi_lokasi.kabkota_id)

    try {


        const result = await prisma.$transaction(async (prisma) => {

            const getTopik = await prisma.topik.findFirst({
                where: {
                    kode_topik: req.body.kode
                }
            })

            if (!getTopik) {
                throw Error('Topik not found');
            }
            let createResponden = await prisma.responden.create({
                data: {
                    topik: {
                        connect: { id: Number(getTopik.id) } // Menyambungkan dengan topik berdasarkan id
                    },
                    kode_responden: generateYMDHIS(),
                    // provinsi: {
                    //     connect: { provinsi_id: Number(req.body.informasi_lokasi.provinsi_id) }
                    // },
                    // kabkota: {
                    //     connect: { kabkota_id: Number(req.body.informasi_lokasi.kabkota_id) }
                    // }
                    provinsiidd: Number(req.body.informasi_lokasi.provinsi_id),
                    kabkotaidd: Number(req.body.informasi_lokasi.kabkota_id)
                }
            })


            const detailRespondenData = data
                .filter(item => item.no !== "0") // Hanya memilih item yang no-nya tidak 0
                .map(item => ({
                    no_urut: Number(item.no),
                    topik_id: Number(getTopik.id),
                    responden_id: Number(createResponden.id),
                    name_input: item.name,
                    type: item.type,
                    title: item.title,
                    value: escapeHtml(String(item.value)),
                }));


            await prisma.detail_responden.createMany({
                data: detailRespondenData
            });
            return 'survey has ben createdd'

        });



        res.status(201).send({
            data: result
        })
    } catch (error) {
        logger.error(`ERROR MESSAGE  ${error.message}`)
        res.status(400).json({ error: error.message });
    } finally {
        await prisma.$disconnect();
    }
}

const getDetailSurveyByKodeResponden = async (req, res) => {
    let { kode_responden } = req.query

    if (kode_responden == undefined) {
        return res.status(404).json({
            success: false,
            message: "paramter not found"
        })
    }
    const result = await prisma.$queryRawUnsafe(`select distinct 
                            tp.kode_topik,
                            sk.nama_kategori, sk.nama_sub_kategori, sd.nama_subdata,
                            dr.name_input, dr.value, dr.no_urut, dr.title
                            from responden rp 
                                inner join topik tp on rp.topik_id = tp.id 
                                inner join sub_kategori sk on sk.id  = tp.subkategori_id 
                                inner join subdata sd on sd.id  = tp.subdata_id 
                                inner join detail_responden dr ON dr.responden_id  = rp.id 
                                where rp.kode_responden = $1
                            order by dr.no_urut asc`, kode_responden)

    res.status(200).send({
        data: result
    })
}

const getAllSurvey = async (req, res) => {

    let { page, limit } = req.query

    page = Number(page) || 1
    limit = Number(limit) || 10


    const offset = (page - 1) * limit


    // const result = await prisma.$queryRawUnsafe(`select 
    //                 rp.kode_responden,
    //                 tp.kode_topik,
    //                 sk.nama_kategori, sk.nama_sub_kategori, sd.nama_subdata, rp.created_at
    //             from responden rp 
    //                 inner join topik tp on rp.topik_id = tp.id 
    //                 inner join sub_kategori sk on sk.id  = tp.subkategori_id 
    //                 inner join subdata sd on sd.id  = tp.subdata_id 
    //             order by rp.created_at desc
    //              limit $1 offset ($2 - 1) * $1`, page, limit)

    const result = await prisma.$queryRawUnsafe(`select 
        rp.kode_responden,
        tp.kode_topik,
        sk.nama_kategori, sk.nama_sub_kategori, sd.nama_subdata, rp.created_at
    from responden rp 
        inner join topik tp on rp.topik_id = tp.id 
        inner join sub_kategori sk on sk.id  = tp.subkategori_id 
        inner join subdata sd on sd.id  = tp.subdata_id 
    order by rp.created_at desc
     limit $1 offset $2`, limit, offset)



    let totalItems = await prisma.$queryRaw`select count(rp.id) from responden rp`

    totalItems = Number(totalItems[0].count)

    res.status(200).send({
        page,
        limit,
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / limit),
        result

    })
}

module.exports = { storeSurveyDinamis, getDetailSurveyByKodeResponden, getAllSurvey }