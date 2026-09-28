export function formatCurrency(value) {
  const num = typeof value === 'number' ? value : parseFloat(value) || 0;
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseRecordDate(record) {
  if (!record) return null;
  const raw = record.data || record.dia || record.data_hora || record.created_at || (typeof record === 'string' ? record : null);
  if (!raw) return null;

  if (raw instanceof Date) {
    return isNaN(raw.getTime()) ? null : raw;
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    // Check Brazilian format: DD/MM/YYYY or DD/MM/YYYY HH:mm:ss
    const brMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (brMatch) {
      const day = parseInt(brMatch[1], 10);
      const month = parseInt(brMatch[2], 10) - 1;
      const year = parseInt(brMatch[3], 10);
      const hours = brMatch[4] ? parseInt(brMatch[4], 10) : 0;
      const minutes = brMatch[5] ? parseInt(brMatch[5], 10) : 0;
      const seconds = brMatch[6] ? parseInt(brMatch[6], 10) : 0;
      return new Date(year, month, day, hours, minutes, seconds);
    }

    // Try standard Date parsing (ISO 8601 strings, e.g. 2026-09-28T22:44:01.000Z)
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d;
    }

    // Only if it's a 1-2 digit number (day of current month: 1..31)
    if (/^\d{1,2}$/.test(trimmed)) {
      const dayNum = parseInt(trimmed, 10);
      if (dayNum >= 1 && dayNum <= 31) {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), dayNum);
      }
    }
  }

  if (typeof raw === 'number' && raw >= 1 && raw <= 31) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), raw);
  }

  return null;
}

export function isRecordFromToday(record) {
  const d = parseRecordDate(record);
  if (!d) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function getRecordDateString(record) {
  const d = parseRecordDate(record);
  if (!d) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const MAPA_BAIRROS_CACAPAVA = {
  'VAA': 'Vila Antônio Augusto',
  'VP': 'Vila Paraíba',
  'VL PARAIBA': 'Vila Paraíba',
  'VL PARA': 'Vila Paraíba',
  'VCL PARA': 'Vila Paraíba',
  'ME': 'Parque Residencial Maria Elmira',
  'M ELM': 'Parque Residencial Maria Elmira',
  'MARIA EL': 'Parque Residencial Maria Elmira',
  'JD CPV': 'Jardim Caçapava',
  'JRD CPV': 'Jardim Caçapava',
  'JC': 'Jardim Caçapava',
  'ESPE': 'Residencial Esperança',
  'ESP': 'Residencial Esperança',
  'ESPER': 'Residencial Esperança',
  'ES': 'Residencial Esperança',
  'ESÉ': 'Residencial Esperança',
  'BORDA': 'Borda da Mata',
  'BORDA D MATA': 'Borda da Mata',
  'BORDA CAMP': 'Borda da Mata',
  'B CAMPO': 'Borda da Mata',
  'VC': 'Vila Centenário',
  'CENTE': 'Vila Centenário',
  'VL CENTE': 'Vila Centenário',
  'VIL CENTE': 'Vila Centenário',
  'NOVA': 'Parque Residencial Nova Caçapava',
  'NV CPV': 'Parque Residencial Nova Caçapava',
  '´NOVA': 'Parque Residencial Nova Caçapava',
  'NOVS': 'Parque Residencial Nova Caçapava',
  'CENTRO': 'Centro',
  'CENT': 'Centro',
  'VSJ': 'Vila São João',
  'VL SAO JOAO': 'Vila São João',
  'V SAO JOAO': 'Vila São João',
  'VL SJ': 'Vila São João',
  'V SAO J': 'Vila São João',
  'VL SAO J': 'Vila São João',
  'VILA SÃO JOÃO': 'Vila São João',
  'VILA SAO JOAO': 'Vila São João',
  'VB': 'Vila Brasil',
  'VV': 'Vila Velha',
  'VSI': 'Vila Santa Isabel',
  'V SNT ISABEL': 'Vila Santa Isabel',
  'VL SNTA ISABEL': 'Vila Santa Isabel',
  'VL SNT ISAB': 'Vila Santa Isabel',
  'VL SNT ISA': 'Vila Santa Isabel',
  'VL SANT ISABEL': 'Vila Santa Isabel',
  'V SANT ISABEL': 'Vila Santa Isabel',
  'SNT ISA': 'Vila Santa Isabel',
  'SNT ISABEL': 'Vila Santa Isabel',
  'VR': 'Vila Resende',
  'VL RESENDE': 'Vila Resende',
  'V RESENDE': 'Vila Resende',
  'JD S JOSE': 'Jardim São José',
  'JSJ': 'Jardim São José',
  'JD SJ': 'Jardim São José',
  'JRDM SJ': 'Jardim São José',
  'JD S JOS': 'Jardim São José',
  'JD SAO JOS': 'Jardim São José',
  'JD RAFA': 'Jardim Rafael',
  'JD RAF': 'Jardim Rafael',
  'JRDM RAFA': 'Jardim Rafael',
  'JD RAFAEL': 'Jardim Rafael',
  'JR': 'Jardim Rafael',
  'VG': 'Vila Galvão',
  'VL GALVÃO': 'Vila Galvão',
  'VL GALVAO': 'Vila Galvão',
  'VL GALV': 'Vila Galvão',
  'PINUS': 'Pinus do Iriguassu',
  'PINUS 1': 'Pinus do Iriguassu',
  'PINUS1': 'Pinus do Iriguassu',
  'PINUS 2': 'Pinus do Iriguassu',
  'PINUS2': 'Pinus do Iriguassu',
  'PRIMA': 'Jardim Primavera',
  'JD PRIMA': 'Jardim Primavera',
  'JD PRIM': 'Jardim Primavera',
  'JRD PRIMA': 'Jardim Primavera',
  'SAPE': 'Sapé',
  'SAPE 1': 'Sapé',
  'SAPE1': 'Sapé',
  'SAPÉ1': 'Sapé',
  'SAPE 2': 'Sapé',
  'SAPE2': 'Sapé',
  'ELD': 'Jardim Eldorado',
  'ELDORA': 'Jardim Eldorado',
  'ELDORADO': 'Jardim Eldorado',
  'ELDO': 'Jardim Eldorado',
  'ELDORAO': 'Jardim Eldorado',
  'ELDOR': 'Jardim Eldorado',
  'BAND': 'Vila Bandeirantes',
  'VL BAND': 'Vila Bandeirantes',
  'V BAND': 'Vila Bandeirantes',
  'VL BAN': 'Vila Bandeirantes',
  'MC': 'Jardim Maria Cândida',
  'VS': 'Vila Santos',
  'V SANTOS': 'Vila Santos',
  'VL SANTOS': 'Vila Santos',
  'VL SNTS': 'Vila Santos',
  'VILLAGE': 'Village das Flores',
  'VILAGE DAS FLORES': 'Village das Flores',
  'VERA CRUZ': 'Vera Cruz',
  'VERA C': 'Vera Cruz',
  'VR CRUZ': 'Vera Cruz',
  'VERA': 'Vera Cruz',
  'VMJ': 'Vila Menino Jesus',
  'VL MENINO J': 'Vila Menino Jesus',
  'V M J': 'Vila Menino Jesus',
  'V MEN J': 'Vila Menino Jesus',
  'VILA MENINO': 'Vila Menino Jesus',
  'VMSJ': 'Vila Menino Jesus',
  'ALDEIA': 'Condomínio Aldeias da Serra',
  'ALDEIAS': 'Condomínio Aldeias da Serra',
  'ALDEIAS DA SERRA': 'Condomínio Aldeias da Serra',
  'VL IN': 'Vila Independência',
  'VIN': 'Vila Independência',
  'V IND': 'Vila Independência',
  'VL IND': 'Vila Independência',
  'VL INDEP': 'Vila Independência',
  'IND': 'Vila Independência',
  'VL INDEPE': 'Vila Independência',
  'VL INDEPENDECIA': 'Vila Independência',
  'VL INDP': 'Vila Independência',
  'PANORAMA': 'Jardim Panorama',
  'PANOR': 'Jardim Panorama',
  'PAN': 'Jardim Panorama',
  'PANORA': 'Jardim Panorama',
  'JD PANORA': 'Jardim Panorama',
  'PANO': 'Jardim Panorama',
  'JARDIM PANOR': 'Jardim Panorama',
  'JRD PANO': 'Jardim Panorama',
  'PAIOL': 'Paiol Grande',
  'JD JULIETA': 'Jardim Julieta',
  'TIJUCO': 'Bairro do Tijuco',
  'TIJUC': 'Bairro do Tijuco',
  'GRAMA': 'Bairro do Grama',
  'GRMA': 'Bairro do Grama',
  'PQ MUSEU': 'Parque do Museu',
  'PQ DO MUSEU': 'Parque do Museu',
  'PARQUE MUS': 'Parque do Museu',
  'VNSG': 'Vila Nossa Senhora das Graças',
  'NSG': 'Vila Nossa Senhora das Graças',
  'VL NSS SRA DAS G': 'Vila Nossa Senhora das Graças',
  'VL NSS SENH': 'Vila Nossa Senhora das Graças',
  'VIL NSS SENH': 'Vila Nossa Senhora das Graças',
  'RESERVA': 'Condomínio Reserva do Vale',
  'RESRVA': 'Condomínio Reserva do Vale',
  'VAM': 'Jardim Amália',
  'VL NALY': 'Vila Naly',
  'VL PANTA': 'Vila Pantaleão',
  'VL PAN': 'Vila Pantaleão',
  'VL PANTALEAO': 'Vila Pantaleão',
  'ALVORADA': 'Parque Residencial Alvorada',
  'ALVORA': 'Parque Residencial Alvorada',
  'RS ALVOR': 'Parque Residencial Alvorada',
  'ALVOR': 'Parque Residencial Alvorada',
  'ALVO': 'Parque Residencial Alvorada',
  'CG': 'Jardim Campo Grande',
  'JD CAMPO G': 'Jardim Campo Grande',
  'JRDM CAMP': 'Jardim Campo Grande',
  'JD CP GRAN': 'Jardim Campo Grande',
  'JSD CP GRANDE': 'Jardim Campo Grande',
  'JD CG': 'Jardim Campo Grande',
  'JD CP GRANDE': 'Jardim Campo Grande',
  'ST RITA': 'Chácaras Santa Rita',
  'CHAC STA RITA': 'Chácaras Santa Rita',
  'CHAC SNT RITA': 'Chácaras Santa Rita',
  'STA RITA': 'Chácaras Santa Rita',
  'C SNT RITA': 'Chácaras Santa Rita',
  'TERRAS': 'Condomínio Terras do Vale',
  'TERRAS DO VALE': 'Condomínio Terras do Vale',
  'TERAAS': 'Condomínio Terras do Vale',
  'SNT LUZIA': 'Santa Luzia da Boa Vista',
  'ST L': 'Santa Luzia da Boa Vista',
  'SNT LUZ1': 'Santa Luzia da Boa Vista',
  'SNTA LUZIA': 'Santa Luzia da Boa Vista',
  'SANTA LUZIA': 'Santa Luzia da Boa Vista',
  'CPV VELHA': 'Caçapava Velha',
  'CVV': 'Caçapava Velha',
  'PAINEIRAS': 'Residencial Paineiras',
  'CHAC S MI': 'Chácara São Miguel',
  'SAO MIG': 'Chácara São Miguel',
  'V SAO MIGU': 'Chácara São Miguel',
  'PADRE': 'Vila Padre Rodolfo',
  'VL PARAISO': 'Vila Paraíso',
  'PIEDADE': 'Piedade',
  'SNTO ANDRE': 'Parque Residencial Santo André',
  'PQ RES SNT ANDRE': 'Parque Residencial Santo André',
  'SNT ANDR': 'Parque Residencial Santo André',
  'SNT ANDRE': 'Parque Residencial Santo André',
  'M DO JATAY': 'Morada do Jataí',
  'JATAI': 'Morada do Jataí',
  'SAMAMBAIA 2': 'Samambaia',
  'TERRAS ALTAS': 'Terras Altas',
  'VL PRADO': 'Vila Prado',
  'JEQUI': 'Jardim Jequitibá',
  'RES JEQUI': 'Jardim Jequitibá',
  'MORRO CASCAVEL': 'Morro do Cascavel',
  'BOA VISTA': 'Boa Vista',
  'TRINTC': 'Condomínio Trintec',
  'TRINTEC': 'Condomínio Trintec',
  'JRDM AMER': 'Jardim América',
  'PORTAL': 'Portal das Colinas',
  'NANCY': 'Jardim Nancy',
  'SHANGRILA': 'Jardim Shangri-lá',
  'VIL AND MARTINS': 'Vila André Martins',
  'REAL': 'Parque Residencial Real',
  'RREAL': 'Parque Residencial Real'
};

export function normalizeBairroName(rawBairro) {
  if (!rawBairro) return 'Balcão';
  const trimmed = String(rawBairro).trim();
  const upper = trimmed.toUpperCase();
  if (upper === 'BALCAO' || upper === 'BALCÃO') return 'Balcão';
  return MAPA_BAIRROS_CACAPAVA[upper] || trimmed;
}
