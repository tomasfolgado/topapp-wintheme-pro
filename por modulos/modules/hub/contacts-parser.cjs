// Universal Contacts Parser Suite
// Supports: Google Contacts CSV (all languages), Outlook CSV, Apple Contacts CSV,
// Generic CSV/TSV, vCard (.vcf 2.1/3.0/4.0), and arbitrary pasted text.

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.UniversalContactsParser = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  // 1. RFC 4180 Compliant CSV Parser
  function parseCSVRows(text) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let insideQuotes = false;

    const cleanText = (text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      const nextChar = cleanText[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentField += '"';
          i++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\n' && !insideQuotes) {
        currentRow.push(currentField);
        currentField = '';
        if (currentRow.length > 0 && currentRow.some(field => field.trim().length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
      } else {
        currentField += char;
      }
    }

    if (currentField.length > 0 || currentRow.length > 0) {
      currentRow.push(currentField);
      if (currentRow.some(field => field.trim().length > 0)) {
        rows.push(currentRow);
      }
    }

    return rows;
  }

  // 2. Phone Number Normalizer
  function cleanPhoneNumber(raw) {
    if (!raw) return '';
    let str = String(raw).trim();
    let digits = str.replace(/[^\d+]/g, '');
    if (!digits) return '';

    if (digits.startsWith('00')) {
      digits = '+' + digits.slice(2);
    }

    const pureDigits = digits.replace(/\D/g, '');
    if (pureDigits.length < 7 || pureDigits.length > 16) return '';

    // If Spanish 9-digit mobile/landline (starts with 6, 7, 8, or 9)
    if (pureDigits.length === 9 && !digits.startsWith('+')) {
      if (/^[6789]/.test(pureDigits)) {
        return '+34' + pureDigits;
      }
    }

    return digits.startsWith('+') ? digits : ('+' + digits);
  }

  // 3. Extract Contacts from any CSV
  function extractUniversalContactsCSV(csvText) {
    if (!csvText || !csvText.trim()) return [];

    const firstLine = csvText.trim().split('\n')[0];
    let delimiter = ',';
    if (firstLine.includes(';') && (firstLine.split(';').length > firstLine.split(',').length)) {
      delimiter = ';';
    } else if (firstLine.includes('\t') && (firstLine.split('\t').length > firstLine.split(',').length)) {
      delimiter = '\t';
    }

    let rows = [];
    if (delimiter === ',') {
      rows = parseCSVRows(csvText);
    } else {
      rows = csvText.split(/\r?\n/).map(line => line.split(delimiter).map(c => c.trim().replace(/^"|"$/g, '')));
    }

    if (rows.length < 2) return [];

    const header = rows[0].map(h => (h || '').trim().toLowerCase().replace(/^"|"$/g, ''));

    // Name column detection
    const firstNameIdx = header.findIndex(h => h === 'first name' || h === 'nombre' || h === 'given name' || h === 'nombre de pila');
    const middleNameIdx = header.findIndex(h => h === 'middle name' || h === 'segundo nombre' || h === 'additional name');
    const lastNameIdx = header.findIndex(h => h === 'last name' || h === 'apellidos' || h === 'apellido' || h === 'family name');
    const displayNameIdx = header.findIndex(h => h === 'display name' || h === 'nombre para mostrar' || h === 'file as' || h === 'archivar como' || h === 'name' || h === 'contacto');
    const orgIdx = header.findIndex(h => h === 'organization name' || h === 'company' || h === 'organización' || h === 'organizacion' || h === 'empresa' || h === 'nombre de la organización');
    const nicknameIdx = header.findIndex(h => h === 'nickname' || h === 'apodo');

    // Phone column detection: strictly avoid phonetic, label, and category columns
    const phoneCols = [];
    header.forEach((h, idx) => {
      if (h.includes('phonetic') || h.includes('fonético') || h.includes('fonetico')) return;
      if (h.includes('label') || h.includes('tipo') || h.includes('categoria')) return;

      if (
        h.includes('phone') ||
        h.includes('teléfono') ||
        h.includes('telefono') ||
        h.includes('mobile') ||
        h.includes('móvil') ||
        h.includes('movil') ||
        h.includes('celular') ||
        h.includes('particular') ||
        h.includes('trabajo') ||
        h.includes('casa')
      ) {
        let labelIdx = -1;
        if (idx > 0 && (header[idx - 1].includes('label') || header[idx - 1].includes('tipo'))) {
          labelIdx = idx - 1;
        }
        phoneCols.push({ valIdx: idx, labelIdx });
      }
    });

    const contacts = [];
    const seenSet = new Set();

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || !row.length) continue;

      const fName = firstNameIdx !== -1 ? (row[firstNameIdx] || '').trim() : '';
      const mName = middleNameIdx !== -1 ? (row[middleNameIdx] || '').trim() : '';
      const lName = lastNameIdx !== -1 ? (row[lastNameIdx] || '').trim() : '';
      let baseName = [fName, mName, lName].filter(Boolean).join(' ').trim();

      if (!baseName) {
        if (displayNameIdx !== -1 && row[displayNameIdx]?.trim()) baseName = row[displayNameIdx].trim();
        else if (orgIdx !== -1 && row[orgIdx]?.trim()) baseName = row[orgIdx].trim();
        else if (nicknameIdx !== -1 && row[nicknameIdx]?.trim()) baseName = row[nicknameIdx].trim();
        else if (row[0]?.trim() && !cleanPhoneNumber(row[0])) baseName = row[0].trim();
      }

      baseName = baseName.replace(/^["',.]+|["',.]+$/g, '').trim();
      if (!baseName || /^[\s,.?#*:-]+$/.test(baseName)) {
        const phoneOnly = row.map(cleanPhoneNumber).find(Boolean);
        if (phoneOnly) baseName = phoneOnly;
        else continue;
      }

      // Collect all phone numbers
      const phoneList = [];
      for (const pc of phoneCols) {
        const cellVal = row[pc.valIdx] || '';
        if (!cellVal) continue;
        const label = pc.labelIdx !== -1 ? (row[pc.labelIdx] || '').trim() : '';
        const rawParts = cellVal.split(/(?:::|\/|;)/);
        for (const p of rawParts) {
          const subParts = p.includes(',') && !p.includes('+34 6,07') ? p.split(',') : [p];
          for (const sp of subParts) {
            const cleaned = cleanPhoneNumber(sp);
            if (cleaned && !phoneList.some(item => item.phone === cleaned)) {
              phoneList.push({ phone: cleaned, label });
            }
          }
        }
      }

      // Fallback: If no phone in designated columns, inspect remaining cells
      if (phoneList.length === 0) {
        for (let ci = 0; ci < row.length; ci++) {
          const cell = row[ci] || '';
          const cleaned = cleanPhoneNumber(cell);
          if (cleaned && !phoneList.some(item => item.phone === cleaned)) {
            phoneList.push({ phone: cleaned, label: '' });
            break;
          }
        }
      }

      if (phoneList.length === 0) {
        const key = (baseName + '||').toLowerCase();
        if (!seenSet.has(key)) {
          seenSet.add(key);
          contacts.push({ name: baseName, phone: '' });
        }
      } else if (phoneList.length === 1) {
        const key = (baseName + '||' + phoneList[0].phone).toLowerCase();
        if (!seenSet.has(key)) {
          seenSet.add(key);
          contacts.push({ name: baseName, phone: phoneList[0].phone });
        }
      } else {
        // Multiple phone numbers
        phoneList.forEach((item, pIndex) => {
          let entryName = baseName;
          if (pIndex > 0) {
            const lbl = (item.label || '').trim();
            if (lbl && !/^m[oó]vil|mobile$/i.test(lbl)) {
              entryName = `${baseName} (${lbl})`;
            } else {
              entryName = `${baseName} (${pIndex + 1})`;
            }
          }
          const key = (entryName + '||' + item.phone).toLowerCase();
          if (!seenSet.has(key)) {
            seenSet.add(key);
            contacts.push({ name: entryName, phone: item.phone });
          }
        });
      }
    }

    return contacts;
  }

  // 4. Extract Contacts from vCard (.vcf)
  function extractUniversalVCard(text) {
    const contacts = [];
    const cards = (text || '').split(/BEGIN:VCARD/i);
    const seenSet = new Set();

    for (const card of cards) {
      if (!card.trim()) continue;

      let name = '';
      const fnMatch = card.match(/(?:^|\r?\n)FN(?:;[^:]*)?:([^\r\n]+)/i);
      if (fnMatch) name = fnMatch[1].trim();

      if (!name) {
        const nMatch = card.match(/(?:^|\r?\n)N(?:;[^:]*)?:([^\r\n]+)/i);
        if (nMatch) {
          const parts = nMatch[1].split(';').map(p => p.trim()).filter(Boolean);
          name = parts.reverse().join(' ');
        }
      }

      if (!name) {
        const orgMatch = card.match(/(?:^|\r?\n)ORG(?:;[^:]*)?:([^\r\n]+)/i);
        if (orgMatch) name = orgMatch[1].split(';')[0].trim();
      }

      name = (name || '').replace(/^["',.]+|["',.]+$/g, '').trim();
      if (!name) continue;

      const phoneList = [];
      const telMatches = card.matchAll(/(?:^|\r?\n)TEL(?:;([^:]*))?:([^\r\n]+)/gi);
      for (const m of telMatches) {
        const typeStr = (m[1] || '').toUpperCase();
        let label = '';
        if (typeStr.includes('WORK')) label = 'Trabajo';
        else if (typeStr.includes('HOME')) label = 'Casa';
        else if (typeStr.includes('CELL')) label = 'Móvil';

        const cleaned = cleanPhoneNumber(m[2]);
        if (cleaned && !phoneList.some(p => p.phone === cleaned)) {
          phoneList.push({ phone: cleaned, label });
        }
      }

      if (phoneList.length === 0) {
        const key = (name + '||').toLowerCase();
        if (!seenSet.has(key)) {
          seenSet.add(key);
          contacts.push({ name, phone: '' });
        }
      } else if (phoneList.length === 1) {
        const key = (name + '||' + phoneList[0].phone).toLowerCase();
        if (!seenSet.has(key)) {
          seenSet.add(key);
          contacts.push({ name, phone: phoneList[0].phone });
        }
      } else {
        phoneList.forEach((item, pIndex) => {
          let entryName = name;
          if (pIndex > 0) {
            if (item.label && item.label !== 'Móvil') {
              entryName = `${name} (${item.label})`;
            } else {
              entryName = `${name} (${pIndex + 1})`;
            }
          }
          const key = (entryName + '||' + item.phone).toLowerCase();
          if (!seenSet.has(key)) {
            seenSet.add(key);
            contacts.push({ name: entryName, phone: item.phone });
          }
        });
      }
    }

    return contacts;
  }

  // 5. Extract Contacts from Pasted Text
  function extractUniversalPastedContacts(text) {
    const lines = (text || '').split(/\r?\n/);
    const contacts = [];
    const seenSet = new Set();

    for (const line of lines) {
      const l = line.trim();
      if (!l) continue;

      let name = '';
      let rawPhones = '';

      if (l.includes('\t')) {
        const parts = l.split('\t').map(p => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          if (cleanPhoneNumber(parts[0])) {
            rawPhones = parts[0];
            name = parts.slice(1).join(' ');
          } else {
            name = parts[0];
            rawPhones = parts.slice(1).join(' ');
          }
        } else {
          name = parts[0];
        }
      } else if (l.includes(':')) {
        const parts = l.split(':');
        name = parts[0].trim();
        rawPhones = parts.slice(1).join(':').trim();
      } else if (l.includes(' - ')) {
        const parts = l.split(' - ');
        name = parts[0].trim();
        rawPhones = parts.slice(1).join(' - ').trim();
      } else if (l.includes(',')) {
        const parts = l.split(',');
        name = parts[0].trim();
        rawPhones = parts.slice(1).join(',').trim();
      } else {
        const phoneFirst = l.match(/^([+]?[0-9\s-]{7,})\s+(.+)$/);
        if (phoneFirst) {
          rawPhones = phoneFirst[1].trim();
          name = phoneFirst[2].trim();
        } else {
          const nameFirst = l.match(/^(.+?)\s+([+]?[0-9\s-]{7,})$/);
          if (nameFirst) {
            name = nameFirst[1].trim();
            rawPhones = nameFirst[2].trim();
          } else {
            name = l;
          }
        }
      }

      name = (name || '').replace(/^["',.]+|["',.]+$/g, '').trim();
      if (!name) continue;

      const phoneList = [];
      if (rawPhones) {
        const parts = rawPhones.split(/(?:::|\/|;)/);
        for (const p of parts) {
          const cleaned = cleanPhoneNumber(p);
          if (cleaned && !phoneList.includes(cleaned)) {
            phoneList.push(cleaned);
          }
        }
      }

      if (phoneList.length === 0) {
        const key = (name + '||').toLowerCase();
        if (!seenSet.has(key)) {
          seenSet.add(key);
          contacts.push({ name, phone: '' });
        }
      } else if (phoneList.length === 1) {
        const key = (name + '||' + phoneList[0]).toLowerCase();
        if (!seenSet.has(key)) {
          seenSet.add(key);
          contacts.push({ name, phone: phoneList[0] });
        }
      } else {
        phoneList.forEach((phone, pIndex) => {
          const entryName = pIndex === 0 ? name : `${name} (${pIndex + 1})`;
          const key = (entryName + '||' + phone).toLowerCase();
          if (!seenSet.has(key)) {
            seenSet.add(key);
            contacts.push({ name: entryName, phone });
          }
        });
      }
    }

    return contacts;
  }

  return {
    parseCSVRows,
    cleanPhoneNumber,
    extractUniversalContactsCSV,
    extractUniversalVCard,
    extractUniversalPastedContacts
  };
});
