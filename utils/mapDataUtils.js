const fnMapBarChart = (data) => {
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
}

module.exports = { fnMapBarChart }