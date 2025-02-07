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
                    luatPanen: d.luaspanen,
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

module.exports = { getSlider }