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



module.exports = {getSummary, getBencana}