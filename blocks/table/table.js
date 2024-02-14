/*
 * Table Block
 * Recreate a table
 * https://www.hlx.live/developer/block-collection/table
 * Modified to add aria
 */

function buildCell(rowIndex) {
  const cell = rowIndex ? document.createElement('td') : document.createElement('th');
  if (!rowIndex) cell.setAttribute('scope', 'col');
  return cell;
}

export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  [...block.children].forEach((child, i) => {
    const row = document.createElement('tr');
    if (i) tbody.append(row);
    else thead.append(row);
    [...child.children].forEach((col) => {
      const cell = buildCell(i);
      cell.innerHTML = col.innerHTML;
      row.append(cell);
    });
  });

  block.innerHTML = '';
  block.append(table);

  // Set the role of the table
  table.setAttribute('role', 'table');

  // Enhance each header cell
  const headers = table.querySelectorAll('th');
  headers.forEach((header, index) => {
    header.setAttribute('scope', 'col');
    header.setAttribute('role', 'columnheader');
    header.id = `header-${index}`;
  });

  // Enhance each data cell
  const cells = table.querySelectorAll('td');
  cells.forEach((cell, index) => {
    const columnIndex = index % table.rows[0].cells.length;
    const headerId = `header-${columnIndex}`;
    cell.setAttribute('aria-describedby', headerId);
  });
}
