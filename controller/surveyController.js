const prisma = require("../prisma/client");
const { generateYMDHIS } = require("../utils/generateUtil");
const { v4: uuidv4 } = require('uuid');
const escapeHtml = require('html-escape');


const storeSurveyDinamis = async (req, res) => {

    let data = req.body.data

    try {
        const result = await prisma.$transaction(async (prisma) => {

            const getTopik = await prisma.topik.findFirst({
                where: {
                    kode_topik: req.body.kode
                }
            })


            if (!getTopik) {
                throw new Error('Topik not found');
            }
            const createResponden = await prisma.responden.create({
                data: {
                    topik_id: Number(getTopik?.id),
                    kode_responden: generateYMDHIS(),
                }
            })
            const propertyNames = Object.keys(data);
            for (let i = 0; i < propertyNames.length; i++) {
                const [value, title, nourut] = data[propertyNames[i]].split('~');


                await prisma.detail_responden.create({
                    data: {
                        // id: uuidv4(),
                        topik_id: Number(getTopik?.id),
                        responden_id: Number(createResponden?.id),
                        name_input: propertyNames[i],
                        value: escapeHtml(String(value)),
                        title: String(title),
                        no_urut: Number(nourut)
                    }
                })
            }

            return 'survey has ben createdd'

        });

        res.status(201).send({
            data: result
        })
    } catch (error) {
        console.error('Error :', error);
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