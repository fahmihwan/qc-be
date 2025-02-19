const prisma = require("../prisma/client");

const { v4: uuidv4 } = require('uuid');
const getListQrcode = async (req, res) => {

    const result = await prisma.$queryRawUnsafe(`select q.kode_qr,
                        t.topik,
                        sk.nama_kategori,
                        sk.nama_sub_kategori 
                    from topik t 
                    inner join qrcode q on t.id = q.topik_id
                    inner join sub_kategori sk on sk.id = t.subkategori_id 
                    where q.is_active = true`)

    res.status(200).send({
        data: result
    })
}

const storeQRcode = async (req, res) => {

    // 1
    try {
        const result = await prisma.$transaction(async (prisma) => {

            await prisma.qrcode.create({
                data: {
                    kode_qr: uuidv4(),
                    topik_id: Number(req.body.topik_id),
                    created_by: Number(req.body.user_id),
                }
            })

            return 'qrcode has ben created'

        });

        res.status(201).send({
            data: result
        })
    } catch (error) {
        // console.error('Error :', error);
        res.status(400).json({ error: error.message });
    } finally {
        await prisma.$disconnect();
    }
}

const deleteQRcode = async (req, res) => {

    const { kode_qr } = req.params;

    try {
        const findQrcode = await prisma.qrcode.findFirst({
            where: {
                kode_qr: kode_qr,
                is_active: true
            },
        })


        let result
        if (findQrcode) {
            result = await prisma.qrcode.update({
                where: {
                    id: findQrcode?.id,
                },
                data: {
                    is_active: false
                },
            })
        } else {
            throw Error('QrCode not found')
        }

        res.status(201).send({
            data: 'qrcode has ben deleted'
        })
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
}

module.exports = { storeQRcode, getListQrcode, deleteQRcode }