const fs = require('fs');

const raw = fs.readFileSync('LEVL Sleep Protocols App Modalities Data - Sheet1 copy.csv', 'utf8');

function parseCSV(text) {
    let p = '', row = [''], ret = [row], i = 0, r = 0, s = !0, l;
    for (l of text) {
        if ('"' === l) {
            if (s && l === p) row[i] += l;
            s = !s;
        } else if (',' === l && s) l = row[++i] = '';
        else if ('\n' === l && s) {
            if ('\r' === p) row[i] = row[i].slice(0, -1);
            row = ret[++r] = [l = '']; i = 0;
        } else row[i] += l;
        p = l;
    }
    return ret.filter(r => r.length > 1 || r[0] !== '');
}

const data = parseCSV(raw);

const modalities = {};

for (let i = 2; i < data.length; i++) { // Skip headers
    const row = data[i];
    if (row.length < 4) continue;
    
    // Normalize shifting columns (first might be empty)
    let startIdx = 0;
    if (row[0] === '' && row[1] !== '') startIdx = 1;

    const modName = row[startIdx]?.trim();
    const attr = row[startIdx + 1]?.trim();
    const rating = parseInt(row[startIdx + 2], 10);
    const explanation = row[startIdx + 3]?.replace(/\[\d+\]/g, '').trim(); 
    
    if (!modName || !attr || modName === 'Modality') continue;
    
    if (!modalities[modName]) {
        modalities[modName] = {
            name: modName,
            metadata: {}
        };
    }
    
    modalities[modName].metadata[attr] = {
        rating: isNaN(rating) ? null : rating,
        explanation: explanation
    };
}

const escapeSQL = (str) => {
    if (!str) return '';
    return str.replace(/'/g, "''");
};

function getCategory(name) {
    const supps = ['DeepCell', 'Magnesium', 'Theanine', 'Apigenin', 'Lithium', 'Ashwagandha', 'Luteolin', 'Astragalus', 'Melatonin', 'Valerian', 'Cherry', 'Inositol', 'GABA', 'Phosphatidylserine', 'Rhodiola', 'Glycine'];
    const behavior = ['CBT-I', 'NSDR', 'Sleep Stories', 'No Social Media', 'Mouth Taping'];
    const env = ['Sunlight', 'Temperature', 'Lights', 'Blanket', 'Bath', 'Aromatherapy', 'Pink Noise', 'Acupressure'];
    
    const n = name.toLowerCase();
    
    if (supps.some(s => n.includes(s.toLowerCase()))) return 'supplement';
    if (behavior.some(s => n.includes(s.toLowerCase()))) return 'behavioral';
    if (env.some(s => n.includes(s.toLowerCase()))) return 'environmental';
    
    return 'general';
}

function getDesc(name) {
    const meta = modalities[name].metadata;
    if (meta['Evidence Quality'] && meta['Evidence Quality'].explanation) {
        return meta['Evidence Quality'].explanation;
    }
    return `${name} protocol`;
}

let sql = `-- Seed file for Modalities\n\n`;
sql += `INSERT INTO public.modalities (id, name, description, category, default_instructions, metadata)\nVALUES\n`;

const keys = Object.keys(modalities);
for (let i = 0; i < keys.length; i++) {
    const m = modalities[keys[i]];
    const cat = getCategory(m.name);
    const desc = getDesc(m.name);
    const inst = `Evaluate protocol instructions for ${m.name}`;
    const metaJson = JSON.stringify(m.metadata);
    const id = require('crypto').randomUUID();
    
    sql += `  ('${id}', '${escapeSQL(m.name)}', '${escapeSQL(desc)}', '${cat}', '${escapeSQL(inst)}', '${escapeSQL(metaJson)}'::jsonb)${i === keys.length - 1 ? ';' : ','}\n`;
}

fs.writeFileSync('0002_seed_modalities.sql', sql);

console.log(`Generated SQL for ${keys.length} modalities.`);
