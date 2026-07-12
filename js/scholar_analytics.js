const SPREADSHEET_ID = '1mgEeJrmhK88Qm3_rMf23KtUIYflvf3CNsiwH7RLxzYQ';
const SHEET_GID = '726865583';

function parseCSV(csvString) {
    const rows = csvString.trim().split(/\r?\n/);
    return rows.map(row => {
        const columns = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
        return columns ? columns.map(col => col.replace(/^"|"$/g, '').trim()) : [];
    });
}

async function fetchSpreadsheetData() {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${SHEET_GID}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status}`);
            return null;
        }
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error("Error fetching or parsing spreadsheet data:", error);
        return null;
    }
}

function getCellValueByCidAndColumnName(cid, columnName, spreadsheetData) {
    if (!cid || typeof cid !== 'string' || cid.trim() === '') {
        return "Error: Invalid CID provided.";
    }

    const trimmedCid = cid.trim();

    if (!spreadsheetData || spreadsheetData.length === 0) {
        return "Error: Spreadsheet data is unavailable or empty.";
    }

    const headers = spreadsheetData[0];
    const cidIndex = headers.findIndex(header => header.toLowerCase() === 'cid');
    const targetColumnIndex = headers.findIndex(header => header.toLowerCase() === columnName.toLowerCase());

    if (cidIndex === -1) {
        console.error("Column 'cid' not found in spreadsheet headers.");
        return 'Error: "cid" column not found in spreadsheet.';
    }
    if (targetColumnIndex === -1) {
        console.error(`Column '${columnName}' not found in spreadsheet headers.`);
        return `Error: Column '${columnName}' not found in spreadsheet.`;
    }

    for (let i = 1; i < spreadsheetData.length; i++) {
        const row = spreadsheetData[i];
        if (row[cidIndex] && row[cidIndex].trim() === trimmedCid) {
            return row[targetColumnIndex] || 'N/A';
        }
    }

    return `No data found for CID: "${trimmedCid}" and column "${columnName}".`;
}

document.addEventListener('DOMContentLoaded', async () => {
    const htmlDefinedCidElements = Array.from(document.querySelectorAll('a[id]'));

    const htmlDefinedFullIds = htmlDefinedCidElements
                                  .map(a => a.id)
                                  .filter(id => id && id.trim() !== '' && id.startsWith('cid:'));

    const allSpreadsheetData = await fetchSpreadsheetData();

    if (!allSpreadsheetData) {
        htmlDefinedCidElements.forEach(element => {
            if (element && element.id && element.id.startsWith('cid:')) {
                element.textContent = `Failed to load spreadsheet data.`;
            }
        });
        return;
    }

    htmlDefinedFullIds.forEach(fullId => {
        const displayElement = document.getElementById(fullId);
        if (displayElement) {
            const cidWithoutPrefix = fullId.substring(4);

            const cites = getCellValueByCidAndColumnName(cidWithoutPrefix, 'cites', allSpreadsheetData);
            const htmlLink = getCellValueByCidAndColumnName(cidWithoutPrefix, 'html', allSpreadsheetData);

            displayElement.textContent = `${cites}`;

            if (htmlLink && !htmlLink.startsWith('Error:') && htmlLink !== 'N/A') {
                displayElement.href = htmlLink;
                displayElement.target = "_blank";
                displayElement.rel = "noopener noreferrer";
            } else {
                displayElement.removeAttribute('href');
            }
        }
    });
});