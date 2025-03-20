const { default: axios } = require("axios");

// const getSummary = (req, res) => {
//    let {startDate, endDate, provinceId} = req.query 

//    let prov = ''
//    if(provinceId != undefined){
//     prov = `&id=${provinceId}`
//    }


// //    start='2022-01-01'&end='2022-02-01'
//           axios.get(`https://gis.bnpb.go.id/dev/api/summary?start='${startDate}'&end='${endDate}'${prov}`)
//         .then(function (response) {
//           // handle success
//           console.log(response.data);
//         })
//         .catch(function (error) {
//           // handle error
//           console.log(error);
//         })
//         .finally(function () {
//           // always executed
//         });
    
//         res.status(200).send({
//             data: 'https'
//         })
// }
const getSummary = async (req, res) => {
    let { startDate, endDate, id } = req.query;

   
    let prov = '';
    if (id !== undefined) {
        prov = `&id=${id}`;
    }

    let url = `https://gis.bnpb.go.id/dev/api/summary?start='${startDate}'&end='${endDate}'${prov}`

    try {
        // Membuat permintaan HTTP dengan axios menggunakan async/await
        const response = await axios.get(url);

        // Menampilkan data yang diterima dari response
        console.log(response.data);

        // Mengirimkan response ke client
        res.status(200).send({
            data: response.data // Mengirimkan data dari API yang di-fetch
        });
    } catch (error) {
        // Menangani error jika ada
        console.error('Error fetching data:', error);
        res.status(500).send({
            error: 'Failed to fetch summary data'
        });
    }
};

const getBencana = async (req, res) => {
    let { startDate, endDate, id } = req.query;

   
    let prov = '';
    if (id !== undefined) {
        prov = `&id=${id}`;
    }

    let url = `https://gis.bnpb.go.id/dev/api/bencana?start='${startDate}'&end='${endDate}'${prov}`

    try {
        // Membuat permintaan HTTP dengan axios menggunakan async/await
        const response = await axios.get(url);

        // Menampilkan data yang diterima dari response
        console.log(response.data);

        // Mengirimkan response ke client
        res.status(200).send({
            data: response.data // Mengirimkan data dari API yang di-fetch
        });
    } catch (error) {
        // Menangani error jika ada
        console.error('Error fetching data:', error);
        res.status(500).send({
            error: 'Failed to fetch summary data'
        });
    }
};

const getByEachBencana = async (req, res) => {
    let { startDate, endDate, category, id } = req.query;

    const listDropDownBencana = [
        "BANJIR",
        "TANAH LONGSOR",
        "GEMPABUMI",
        "ERUPSI GUNUNG API",
        "CUACA EKSTREM",
        "GELOMBANG PASANG DAN ABRASI",
        "KEKERINGAN",
        "KEBAKARAN HUTAN DAN LAHAN",
        "TSUNAMI",
        "GEMPA BUMI DAN TSUNAMI"
    ]

   console.log("ini category", category)
    let prov = '';
    if (id !== undefined) {
        prov = `&id_prov=${id}`;
    }

    try {
        if(category == "SEMUA") {
            const requests = listDropDownBencana.map(async(bencana) => {
                let url = `https://gis.bnpb.go.id/databencana/kabupaten?start='${startDate}'&end='${endDate}'${prov}&kejadian='${bencana}'`
                const response = await axios.get(url)
                return response.data.results
            })

            const results = await Promise.all(requests)

            const mergeData = results.flat()

            console.log("masuk semua")

            res.status(200).send({
                data: {
                    results: mergeData
                }
            })
        } else {
            let cat = '';
            if(category !== undefined){
                cat = `&kejadian='${category}'`;
            }
            
            let url = `https://gis.bnpb.go.id/databencana/kabupaten?start='${startDate}'&end='${endDate}'${prov}${cat}`
            const response = await axios.get(url)
            
            res.status(200).send({
                data: response.data // Mengirimkan data dari API yang di-fetch
            });
        }
    } catch (error) {
        // Menangani error jika ada
        console.error('Error fetching data:', error);
        res.status(500).send({
            error: 'Failed to fetch each category data'
        });
    }
};


module.exports = {getSummary, getBencana, getByEachBencana}