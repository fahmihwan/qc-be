const { body } = require("express-validator")
const prisma = require("../prisma/client");
const logger = require("../config/logging");


const chartDashboardSurveyDinamis = async (req, res) => {
    const { provinsi_id } = req.query;

    // let whereClause = ''
    // if (provinsi_id != undefined) {
    //     whereClause += `and r.provinsi_id = $2`;
    //     params.push(Number(provinsi_id))
    // }


    try {

        let getBody = req.body.body

        let resultPie;
        let resultBar;
        let resultLine = '';
        for (let i = 0; i < getBody.length; i++) {

            let body_topikId = getBody[i].params.body_topikId
            let body_title = getBody[i].params.body_title
            let body_name_input = getBody[i].params.body_name_input


            if (getBody[i].type == 'pie') {
                let caseWhen = body_name_input + '-Comment'
                let name_inputLike = `%${body_name_input}%`
                let params = [body_topikId, body_title, name_inputLike, caseWhen]

                let whereClause = ''
                if (provinsi_id != undefined) {
                    whereClause += `and r.provinsi_id = $5`;
                    params.push(Number(provinsi_id))
                }

                resultPie = await prisma.$queryRawUnsafe(`select  x.value, count(x.value)from (
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

                resultPie = resultPie.reduce((acc, item) => {
                    const key = item.value;
                    const count = Number(item.count);
                    acc[key] = (acc[key] || 0) + count;
                    return acc;
                }, {});
            }

            if (getBody[i].type == 'bar') {
                let caseWhen = body_name_input + '-Comment'
                let name_inputLike = `%${body_name_input}%`
                let params = [body_topikId, body_title, name_inputLike, caseWhen]

                let whereClause = ''
                if (provinsi_id != undefined) {
                    whereClause += `and r.provinsi_id = $5`;
                    params.push(Number(provinsi_id))
                }

                resultBar = await prisma.$queryRawUnsafe(`select year, value, count(value) from (
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
                                        and dr.title = $2 
                                        and dr.name_input ilike $3
                                        ${whereClause}
                            ) as x 
                            group by value, year
                            order by year desc`, ...params)

                const formatData = (data) => {
                    const result = [];

                    const categories = Array.from(new Set(data.map(item => item.value)));

                    const groupedData = data.reduce((acc, { value, count, year }) => {
                        if (!acc[year]) acc[year] = [];
                        acc[year].push({ value, count: parseInt(count) });
                        return acc;
                    }, {});

                    for (const year in groupedData) {
                        const yearData = { year: parseInt(year) };

                        categories.forEach(category => {
                            yearData[category] = 0;
                        });

                        groupedData[year].forEach(item => {
                            const category = item.value;

                            if (yearData[category] !== undefined) {
                                yearData[category] += item.count;
                            } else {
                                yearData["Lainnya"] = (yearData["Lainnya"] || 0) + item.count;
                            }
                        });

                        result.push(yearData);
                    }
                    return result;
                };

                resultBar = formatData(resultBar);


            }

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


                resultLine = await prisma.$queryRawUnsafe(`select 
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
            }
        }

        let result = {
            resultPie: resultPie,
            resultBar: resultBar,
            resultLine: resultLine
        }

        res.status(200).send({
            data: result,
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