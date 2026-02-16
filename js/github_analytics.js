const SPREADSHEET_ID = '1ODyEBDLrGlE80Vwie3f54CZcrl35nk4E7TKU66DpO_w';
const TABLE_SHEET_GID = '726865583';
const CHART_SHEET_GID = '0'; 

function applyStyles(element, styles) {
    for (const prop in styles) {
        element.style[prop] = styles[prop];
    }
}

async function fetchGoogleSheetData(sheetGid) {
    const apiUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${sheetGid}`; 
    const response = await fetch(apiUrl);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}. Please ensure the Google Sheet is published to the web.`);
    }

    const text = await response.text();
    const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const data = JSON.parse(jsonString);

    const cols = data.table.cols;
    const rows = data.table.rows;

    const transformedData = [];
    rows.forEach(row => {
        const rowObject = {};
        row.c.forEach((cell, index) => {
            const colId = cols[index].label || cols[index].id;
            rowObject[colId] = cell ? (cell.f || cell.v || '') : '';
        });
        transformedData.push(rowObject);
    });
    return transformedData;
}

async function renderTable(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Table container with ID '${containerId}' not found!`);
        return;
    }

    applyStyles(container, {
        borderRadius: '0.5rem',
        backgroundColor: 'transparent', 
        marginBottom: '0', 
        padding: '0.5rem' 
    });

    container.innerHTML = `<p class="loading-message">Loading table data...</p>`;
    applyStyles(container.querySelector('.loading-message'), {
        textAlign: 'center',
        color: '#4b5563',
        fontSize: '1.125rem',
        padding: '1rem'
    });


    try {
        const data = await fetchGoogleSheetData(TABLE_SHEET_GID);

        container.innerHTML = ``;

        if (data.length === 0) {
            const noDataMessage = document.createElement('p');
            noDataMessage.textContent = "No data available in the Google Sheet for the table.";
            applyStyles(noDataMessage, {
                textAlign: 'center',
                color: '#4b5563',
                fontSize: '1.125rem',
                padding: '1rem'
            });
            container.appendChild(noDataMessage);
            return;
        }

        const table = document.createElement('table');
        applyStyles(table, {
            borderCollapse: 'collapse',
            borderSpacing: '0',
            maxWidth: '100%',
            margin: '0', 
            backgroundColor: '#ffffff',
            borderRadius: '0.5rem', 
            overflow: 'hidden' 
        });
        
        const thead = document.createElement('thead');
        applyStyles(thead, {
            backgroundColor: '#f3f4f6'
        });
        const headerRow = document.createElement('tr');

        const headers = Object.keys(data[0]);
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            applyStyles(th, {
                padding: '0.75rem 1.5rem',
                textAlign: 'left',
                fontSize: '0.75rem',
                fontWeight: '500',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '1px solid #e5e7eb'
            });
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        data.forEach(rowData => {
            const row = document.createElement('tr');
            Object.entries(rowData).forEach(([columnName, cellData]) => {
                const td = document.createElement('td');
                applyStyles(td, {
                    padding: '0.5rem 1.5rem',
                    whiteSpace: 'nowrap',
                    fontSize: '0.875rem',
                    color: '#374151',
                    backgroundColor: '#ffffff',
                    borderBottom: '1px solid #e5e7eb'
                });

                if (columnName.toLowerCase() === 'link') {
                    const anchor = document.createElement('a');
                    anchor.href = cellData;
                    anchor.textContent = cellData;
                    anchor.target = '_blank'; 
                    applyStyles(anchor, {
                        color: '#2563eb',
                        textDecoration: 'underline'
                    });
                    anchor.onmouseover = function() { this.style.color = '#1d4ed8'; };
                    anchor.onmouseout = function() { this.style.color = '#2563eb'; };
                    td.appendChild(anchor);
                } else {
                    td.textContent = cellData;
                }
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        container.appendChild(table);

    } catch (error) {
        console.error('Error fetching or rendering table data:', error);
        container.innerHTML = `
            <p style="text-align: center; color: #dc2626; font-size: 1.125rem; padding: 1rem;">Failed to load table data. Please ensure the Google Sheet is published to the web and accessible.</p>
            <p style="text-align: center; color: #6b7280; font-size: 0.875rem; margin-top: 0.5rem;">Error: ${error.message}</p>
        `;
         applyStyles(container.querySelector('p:first-child'), {
            textAlign: 'center',
            color: '#dc2626',
            fontSize: '1.125rem',
            padding: '1rem'
        });
        applyStyles(container.querySelector('p:last-child'), {
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '0.875rem',
            marginTop: '0.5rem'
        });
    }
}

let chartInstance = null; 
let allChartData = []; 
let minOverallDate = null;
let maxOverallDate = null;

function filterChartData(data, startDateStr, endDateStr) {
    let filteredMinDate = null;
    let filteredMaxDate = null;
    const dataByDate = new Map();

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const dateStr = row['timestamp']; 
        const dateParsed = String(dateStr).match(/Date\((\d+),\s*(\d+),\s*(\d+)\)/);
     
        let rowMomentDate;
        if (dateParsed && dateParsed.length === 4) {
            rowMomentDate = moment(new Date(parseInt(dateParsed[1]), parseInt(dateParsed[2]), parseInt(dateParsed[3])));
        } else {
            rowMomentDate = moment(dateStr);
        }
        
        if (rowMomentDate.isValid()) {
            const formattedDate = rowMomentDate.format('YYYY-MM-DD');
            dataByDate.set(formattedDate, row);

            if (!filteredMinDate || rowMomentDate.isBefore(filteredMinDate)) {
                filteredMinDate = moment(rowMomentDate);
            }
            if (!filteredMaxDate || rowMomentDate.isAfter(filteredMaxDate)) {
                filteredMaxDate = moment(rowMomentDate);
            }
        }
    }

    const effectiveStartDate = startDateStr ? moment(startDateStr) : filteredMinDate;
    const effectiveEndDate = endDateStr ? moment(endDateStr) : filteredMaxDate;

    const labels = [];
    if (effectiveStartDate && effectiveEndDate) {
        let currentDate = moment(effectiveStartDate);
        while (currentDate.isSameOrBefore(effectiveEndDate, 'day') && currentDate.isSameOrBefore(filteredMaxDate, 'day')) {
          if (currentDate.isSameOrAfter(filteredMinDate, 'day')) {
              labels.push(currentDate.toDate());
          }
          currentDate.add(1, 'day');
        }
    }

    const colors = [
        "rgb(0, 0, 0)", "rgb(205, 92, 92)", "rgb(31, 120, 180)", "rgb(166, 206, 227)",
        "rgb(255, 127, 0)", "rgb(253, 191, 111)", "rgb(202, 178, 214)", "rgb(252, 205, 229)",
        "rgb(106, 61, 154)", "rgb(255, 237, 111)", "rgb(217, 217, 217)"
    ];

    const datasets = [];
    const firstRowKeys = data.length > 0 ? Object.keys(data[0]) : [];
    const showRepos = ["FIRECAM", "HMS-Smoke", "GOFER"];

    for (let j = 0; j < firstRowKeys.length; j++) {
        const repoName = firstRowKeys[j];
        
        if (repoName === 'timestamp') {
            continue;
        }

        const series_data = labels.map(date => {
            const dateKey = moment(date).format('YYYY-MM-DD');
            const rowData = dataByDate.get(dateKey);
            if (rowData) {
                const value = rowData[repoName];
                return (value !== '' && value !== null && !isNaN(parseFloat(value))) ? parseFloat(value) : null;
            } else {
                return null; 
            }
        });

        const hiddenFlag = !showRepos.includes(repoName);

        const dataset = {
            label: repoName,
            data: series_data,
            pointRadius: 0,
            borderWidth: 2,
            hidden: hiddenFlag,
            borderColor: colors[datasets.length % colors.length],
            backgroundColor: 'rgba(0, 0, 0, 0)'
        };
        datasets.push(dataset);
    }

    return { labels, datasets };
}


async function renderChart(canvasId, containerId) {
    const canvas = document.getElementById(canvasId);
    const container = document.getElementById(containerId);
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    applyStyles(container, {
        borderRadius: '0.5rem',
        backgroundColor: '#ffffff', 
        marginBottom: '0', 
        minHeight: '475px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0' 
    });

    applyStyles(canvas, {
        maxWidth: '100%',
        height: 'auto',
        borderRadius: '0.5rem',
        display: 'none' 
    });

    const initialLoadingMessage = container.querySelector('.loading-message');
    if (initialLoadingMessage) {
         applyStyles(initialLoadingMessage, {
            textAlign: 'center',
            color: '#4b5563',
            fontSize: '1.125rem',
            padding: '1rem',
            display: 'block'
        });
    }
    

    try {
        if (allChartData.length === 0) { 
            allChartData = await fetchGoogleSheetData(CHART_SHEET_GID);

            let fetchedMinDate = null;
            let fetchedMaxDate = null;
            for (let i = 1; i < allChartData.length; i++) {
                const row = allChartData[i];
                const dateStr = row['timestamp'];
                const dateParsed = String(dateStr).match(/Date\((\d+),\s*(\d+),\s*(\d+)\)/);
                let rowMomentDate;
                if (dateParsed && dateParsed.length === 4) {
                    rowMomentDate = moment(new Date(parseInt(dateParsed[1]), parseInt(dateParsed[2]), parseInt(dateParsed[3])));
                } else {
                    rowMomentDate = moment(dateStr);
                }

                if (rowMomentDate.isValid()) {
                    if (!fetchedMinDate || rowMomentDate.isBefore(fetchedMinDate)) {
                        fetchedMinDate = moment(rowMomentDate);
                    }
                    if (!fetchedMaxDate || rowMomentDate.isAfter(fetchedMaxDate)) {
                        fetchedMaxDate = moment(rowMomentDate);
                    }
                }
            }
            minOverallDate = fetchedMinDate;
            maxOverallDate = fetchedMaxDate;

            if (startDateInput && minOverallDate) {
                startDateInput.value = minOverallDate.format('YYYY-MM-DD');
            }
            if (endDateInput && maxOverallDate) {
                endDateInput.value = maxOverallDate.format('YYYY-MM-DD');
            }
        }


        if (initialLoadingMessage) {
            initialLoadingMessage.style.display = 'none'; 
        }
        canvas.style.display = 'block'; 

        if (allChartData.length <= 1) { 
            container.innerHTML = `
                <p class="loading-message">Not enough data available in the Google Sheet for the chart.</p>
            `;
            applyStyles(container.querySelector('.loading-message'), {
                textAlign: 'center',
                color: '#4b5563',
                fontSize: '1.125rem',
                padding: '1rem'
            });
            canvas.style.display = 'none';
            return;
        }

        const selectedStartDate = startDateInput.value;
        const selectedEndDate = endDateInput.value;

        const { labels, datasets } = filterChartData(allChartData, selectedStartDate, selectedEndDate);


        if (labels.length === 0) {
             container.innerHTML = `
                <p class="loading-message">No data for the selected date range. Please adjust the dates.</p>
            `;
            applyStyles(container.querySelector('.loading-message'), {
                textAlign: 'center',
                color: '#4b5563',
                fontSize: '1.125rem',
                padding: '1rem'
            });
            canvas.style.display = 'none';
            return;
        }

        const chartdata = {
            labels: labels,
            datasets: datasets
        };

        if (chartInstance) {
            chartInstance.destroy();
        }

        const ctx = canvas.getContext('2d');
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: chartdata,
            options: {
                responsive: true,
                maintainAspectRatio: false, 
                scales: {
                    x: {
                        type: 'time', 
                        time: {
                            tooltipFormat: 'Y-MM-DD',
                            unit: 'day',
                            displayFormats: {
                                day: 'Y-MM-DD'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Date',
                            color: '#374151',
                            font: { 
                                weight: 'bold',
                                size: 16
                            }
                        },
                        ticks: {
                            color: '#374151',
                            autoSkip: true, 
                            maxRotation: 45,
                            minRotation: 45,
                            font: {
                                size: 13
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Count',
                            color: '#374151',
                            font: { 
                                weight: 'bold',
                                size: 16
                            }
                        },
                        ticks: {
                            color: '#374151',
                            font: {
                                size: 13
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        intersect: false,
                        position: 'nearest'
                    },
                    legend: {
                        labels: {
                            color: '#374151',
                            font: {
                                size: 14
                            }
                        }
                    }
                }
            }
        });

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (entry.target === container) {
                    if (chartInstance) {
                        chartInstance.resize();
                    }
                }
            }
        });
        resizeObserver.observe(container);
    } catch (error) {
        console.error('Error fetching or rendering chart data:', error);
        container.innerHTML = `
            <p style="text-align: center; color: #dc2626; font-size: 1.125rem; padding: 1rem;">Failed to load chart data. Please ensure the Google Sheet is published to the web and accessible.</p>
            <p style="text-align: center; color: #6b7280; font-size: 0.875rem; margin-top: 0.5rem;">Error: ${error.message}</p>
        `;
         applyStyles(container.querySelector('p:first-child'), {
            textAlign: 'center',
            color: '#dc2626',
            fontSize: '1.125rem',
            padding: '1rem'
        });
        applyStyles(container.querySelector('p:last-child'), {
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '0.875rem',
            marginTop: '0.5rem'
        });
    }
}

window.onload = async function() {
    const chartWrapper = document.getElementById('chart-container-wrapper');
    const tableWrapper = document.getElementById('table-container-wrapper');

    applyStyles(chartWrapper, {
        maxWidth: '96rem',
        margin: '0 auto',
        padding: '0' 
    });
    applyStyles(tableWrapper, {
        maxWidth: '96rem',
        margin: '0 auto',
        padding: '0' 
    });

    await renderChart('chart-canvas', 'chart-section'); 
    renderTable('table-section');

    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const resetDatesBtn = document.getElementById('reset-dates-btn'); 

    startDateInput.addEventListener('change', () => renderChart('chart-canvas', 'chart-section'));
    endDateInput.addEventListener('change', () => renderChart('chart-canvas', 'chart-section'));

    resetDatesBtn.addEventListener('click', () => {
        if (minOverallDate && maxOverallDate) {
            startDateInput.value = minOverallDate.format('YYYY-MM-DD');
            endDateInput.value = maxOverallDate.format('YYYY-MM-DD');
            renderChart('chart-canvas', 'chart-section'); 
        }
    });

    window.addEventListener('resize', () => {
        const tableSection = document.getElementById('table-section');
        const table = tableSection.querySelector('table');
        if (table) {
            if (window.innerWidth <= 768) {
                table.style.display = 'block';
                table.style.overflowX = 'auto';
            } else {
                table.style.display = ''; 
                table.style.overflowX = ''; 
            }
        }
    });

    const tableSection = document.getElementById('table-section');
    const table = tableSection.querySelector('table');
    if (table) {
        if (window.innerWidth <= 768) {
            table.style.display = 'block';
            table.style.overflowX = 'auto';
        }
    }
};
