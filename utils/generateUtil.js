const generateYMDHIS = (params) => {

    const now = new Date();

    const year = now.getFullYear(); // Tahun (4 digit)
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Bulan (2 digit)
    const day = String(now.getDate()).padStart(2, '0'); // Hari (2 digit)
    const hour = String(now.getHours()).padStart(2, '0'); // Jam (2 digit)
    const minute = String(now.getMinutes()).padStart(2, '0'); // Menit (2 digit)
    const second = String(now.getSeconds()).padStart(2, '0'); // Detik (2 digit)

    return `${year}${month}${day}${hour}${minute}${second}`;


}

module.exports = { generateYMDHIS }