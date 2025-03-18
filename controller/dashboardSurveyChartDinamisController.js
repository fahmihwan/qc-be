const { body } = require("express-validator")
const prisma = require("../prisma/client");
const logger = require("../config/logging");
const { fnMapBarChart } = require("../utils/mapDataUtils");


const chartDashboardSurveyDinamis = async (req, res) => {
    const { provinsi_id } = req.query;

    // let whereClause = ''
    // if (provinsi_id != undefined) {
    //     whereClause += `and r.provinsi_id = $2`;
    //     params.push(Number(provinsi_id))
    // }


    try {
        console.log(req.body)
        let getBody = req.body.body

        // let resultPie;
        // let resultBar;
        // let resultLine = '';

        let results = [];
        for (let i = 0; i < getBody.length; i++) {

            let body_topikId = getBody[i].params.body_topikId
            let body_title = getBody[i].params.body_title
            let body_name_input = getBody[i].params.body_name_input

            let resultItem = {
                index: i,
                type: getBody[i].type,
                data: null
            }

            if (getBody[i].type == 'pie') {
                let caseWhen = body_name_input + '-Comment'
                let name_inputLike = `%${body_name_input}%`
                let params = [body_topikId, body_title, name_inputLike, caseWhen]

                let whereClause = ''
                if (provinsi_id != undefined) {
                    whereClause += `and r.provinsi_id = $5`;
                    params.push(Number(provinsi_id))
                }

                let resultPie = await prisma.$queryRawUnsafe(`select  x.value, count(x.value)from (
                            select
                                case 
                                    WHEN dr.name_input = $4 THEN 'lainnya'
                                    else dr.value 
                                end as value 
                            from responden r
                                inner join topik tp on tp.id = r.topik_id
                                inner join provinsi p on p.provinsi_id  = r.provinsi_id 
                                inner join kabupaten_kota kk on kk.kabkota_id = r.kabkota_id 
                                inner join detail_responden dr on r.id  = dr.responden_id 
                            where r.topik_id = $1 and dr.title = $2 and dr.name_input ilike $3
                            ${whereClause}
                        ) as x
                        group by  x.value`, ...params)

                resultItem.data = resultPie.reduce((acc, item) => {
                    const key = item.value;
                    const count = Number(item.count);
                    acc[key] = (acc[key] || 0) + count;
                    return acc;
                }, {});
            }


            if (getBody[i].type == 'bar-keberlanjutanproduksipangan') {
                let params = [body_topikId]

                let whereClause = ''
                if (provinsi_id != undefined) {
                    whereClause += `and r.provinsi_id = $5`;
                    params.push(Number(provinsi_id))
                }

                let resultBar = await prisma.$queryRawUnsafe(`select year, value, count(value) from (
                    	select
                    		case 
                    			when dr.name_input = 'question2' then 'Bibit Unggul'
                    			when dr.name_input = 'question3' then 'Irigasi'
                    			when dr.name_input = 'question4' then 'Alat Pertanian Modern'
                    		end as value,
                    		EXTRACT(YEAR FROM r.created_at) as year
                        from responden r
                            inner join topik tp on tp.id = r.topik_id
                            inner join provinsi p on p.provinsi_id  = r.provinsi_id 
                            inner join kabupaten_kota kk on kk.kabkota_id = r.kabkota_id 
                            inner join detail_responden dr on r.id  = dr.responden_id 
                        WHERE r.topik_id = $1
                            and dr.name_input in ('question2','question3','question4')
                            and dr.value = 'Ya' 
                            ${whereClause}
				) as x                            
				group by value, year
                order by year desc`, ...params);


                resultItem.data = fnMapBarChart(resultBar);
            }

            if (getBody[i].type == 'bar-realisasidistribusipangan') {
                let caseWhen = body_name_input + '-Comment'
                let name_inputLike = `%${body_name_input}%`
                let params = [body_topikId, body_title, name_inputLike, caseWhen]

                let whereClause = ''
                if (provinsi_id != undefined) {
                    whereClause += `and r.provinsi_id = $5`;
                    params.push(Number(provinsi_id))
                }

                let resultBar = await prisma.$queryRawUnsafe(`select year, value, count(value) from (
                      select
                            case 
                                WHEN dr.value = 'Tidak' THEN 'Bermasalah'
                                when dr.value = 'Ya' THEN 'Lancar'
                            end as value,
                            EXTRACT(YEAR FROM r.created_at) as year
                        from responden r
                            inner join topik tp on tp.id = r.topik_id
                            inner join provinsi p on p.provinsi_id  = r.provinsi_id 
                            inner join kabupaten_kota kk on kk.kabkota_id = r.kabkota_id 
                            inner join detail_responden dr on r.id  = dr.responden_id 
                        where r.topik_id = $1
                            and dr.title = $2
                            and dr.name_input ilike $3
                            ${whereClause}
                ) as x 
                group by value, year
                order by year desc`, ...params);

                resultItem.data = fnMapBarChart(resultBar);
            }

            if (getBody[i].type == 'bar-tahun') {
                let caseWhen = body_name_input + '-Comment'
                let name_inputLike = `%${body_name_input}%`
                let body_title_like = `%${body_title}%`
                let params = [body_topikId, body_title_like, name_inputLike, caseWhen]

                let whereClause = ''
                if (provinsi_id != undefined) {
                    whereClause += `and r.provinsi_id = $5`;
                    params.push(Number(provinsi_id))
                }

                let resultBar = await prisma.$queryRawUnsafe(`select year, value, count(value) from (
                                  select
                                        case 
                                            WHEN dr.name_input = $4 THEN 'Lainnya'
                                            else dr.value 
                                        end as value,
                                        EXTRACT(YEAR FROM r.created_at) as year
                                    from responden r
                                        inner join topik tp on tp.id = r.topik_id
                                        inner join provinsi p on p.provinsi_id  = r.provinsi_id 
                                        inner join kabupaten_kota kk on kk.kabkota_id = r.kabkota_id 
                                        inner join detail_responden dr on r.id  = dr.responden_id 
                                    where r.topik_id = $1 
                                        and dr.title ilike $2 
                                        and dr.name_input ilike $3
                                        and dr.value != ''
                                        ${whereClause}
                            ) as x 
                            group by value, year
                            order by year desc`, ...params)
                resultItem.data = fnMapBarChart(resultBar);
            }




            // description: kalau ada url paramter provinsi_id maka di groupby kabkota, kalau tidak ada groupBy provinsi
            if (getBody[i].type == 'bar-count-provinces-and-regency') { //data 
                let caseWhen = body_name_input + '-Comment'
                let name_inputLike = `%${body_name_input}%`
                let params = [body_topikId, body_title, name_inputLike, caseWhen]

                let whereClause = ''
                let groupBy = ''
                let selectBy = ''

                if (provinsi_id != undefined) {
                    whereClause += `and r.provinsi_id = $5`;
                    params.push(Number(provinsi_id))
                    groupBy = `,r.kabkota_id`
                    selectBy = ',r.kabkota_id'

                } else if (provinsi_id == undefined) {
                    groupBy = `,r.provinsi_id`
                    selectBy = ',r.provinsi_id'
                }

                let resultBar = await prisma.$queryRawUnsafe(`select year, value, count(value) from (
                					select
                                        case 
                                            WHEN dr.name_input = 'question1-Comment' THEN 'Lainnya'
                                            else dr.value 
                                        end as value,
                                        EXTRACT(YEAR FROM r.created_at) as year
                                        ${selectBy}
                                    from responden r
                                        inner join topik tp on tp.id = r.topik_id
                                        inner join provinsi p on p.provinsi_id  = r.provinsi_id 
                                        inner join kabupaten_kota kk on kk.kabkota_id = r.kabkota_id 
                                        inner join detail_responden dr on r.id  = dr.responden_id 
                                    where r.topik_id = $1 
                                        and dr.title ilike $2
                                        and dr.name_input ilike $3
                                        and dr.value != ''
                                        ${whereClause}
                					group by dr.value, dr.name_input, EXTRACT(YEAR FROM r.created_at) ${groupBy}
                			) as x 
                            group by value, year
                            order by year desc`, ...params)

                resultItem.data = fnMapBarChart(resultBar);
            }


            // if (getBody[i].type == 'bar-tahun_jumlah_derah') { //data 
            //     let caseWhen = body_name_input + '-Comment'
            //     let name_inputLike = `%${body_name_input}%`
            //     let params = [body_topikId, body_title, name_inputLike, caseWhen]

            //     let whereClause = ''
            //     if (provinsi_id != undefined) {
            //         whereClause += `and r.provinsi_id = $5`;
            //         params.push(Number(provinsi_id))
            //     }

            //     let resultBar = await prisma.$queryRawUnsafe(`select year, value, count(value) from (
            //                       select
            //                             case 
            //                                 WHEN dr.name_input = $4 THEN 'Lainnya'
            //                                 else dr.value 
            //                             end as value,
            //                             EXTRACT(YEAR FROM r.created_at) as year
            //                         from responden r
            //                             inner join topik tp on tp.id = r.topik_id
            //                             inner join provinsi p on p.provinsi_id  = r.provinsi_id 
            //                             inner join kabupaten_kota kk on kk.kabkota_id = r.kabkota_id 
            //                             inner join detail_responden dr on r.id  = dr.responden_id 
            //                         where r.topik_id = $1 
            //                             and dr.title = $2 
            //                             and dr.name_input ilike $3
            //                             and dr.value != ''
            //                             ${whereClause}
            //                 ) as x 
            //                 group by value, year
            //                 order by year desc`, ...params)


            //     resultItem.data = fnMapBarChart(resultBar);
            // }



            // ok
            if (getBody[i].type == 'line') {
                let caseWhenMeningkat = body_name_input + '-Inputopsi-ya_meningkat'
                let caseWhenMenurun = body_name_input + '-Inputopsi-ya_menurun'
                let name_inputLike = `%${body_name_input}%`
                let provinsiId = Number(provinsi_id)


                let params = [body_topikId, body_title, name_inputLike,
                    caseWhenMeningkat, caseWhenMenurun]

                let whereClause = ''
                if (provinsi_id != undefined) {
                    whereClause += `and r.provinsi_id = $6`;
                    params.push(Number(provinsi_id))
                }


                let resultLine = await prisma.$queryRawUnsafe(`select 
                          EXTRACT(YEAR FROM x.created_at) as year, 
                          coalesce(sum(meningkat),0) as meningkat,
                          coalesce(sum(menurun),0) as menurun
                          from (
                            select 
                                case 
                                    when name_input = $4 then CAST(dr.value AS NUMERIC)  
                                end as meningkat,
                                  case 
                                    when name_input = $5 then CAST(dr.value AS NUMERIC) 
                                end as menurun,
                                r.created_at
                            from responden r
                            inner join detail_responden dr on r.id = dr.responden_id
                            where r.topik_id = $1
                                and  dr.title = $2
                                and dr.name_input ilike $3
                                ${whereClause}
                    ) as x
                    group by EXTRACT(YEAR FROM x.created_at)`, ...params)

                resultItem.data = resultLine
            }

            results.push(resultItem)
        }

        let result = {
            data: results
        }

        // res.status(200).send({
        //     data: result,
        // })


        res.status(200).send({
            data: results
        })

    } catch (error) {
        logger.error(`Error ${error.message}`)
        res.status(500).send({
            success: false,
            message: error.message,
        });

    }


}


module.exports = { chartDashboardSurveyDinamis }