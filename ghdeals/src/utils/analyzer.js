const buildPrompt = (radiusMiles, monthsBack) => `You are an expert real estate wholesale deal analyzer.

Return ONLY a raw JSON object. No markdown. No backticks. No explanation. Just the JSON.

COMP RULES:
- Only comps sold within the last ${monthsBack} months
- Only comps within ${radiusMiles} miles of subject property
- Renovated or updated comps only (flag if as-is used)
- Match beds/baths closely
- Return 4-5 comps
- For each comp include a Zillow search URL: https://www.zillow.com/homes/[address-slug]_rb/ and a Redfin search URL: https://www.redfin.com/city/[city]/[state]/[street]-[number]

FORMULAS (strictly enforce):
- MAO = ARV × (mao_pct / 100) − repairs
- my_offer = MAO − value between 5000 and 15000
- end_buyer_offer = MAO exactly
- assignment_fee = end_buyer_offer − my_offer

REPAIR BREAKDOWN: Individual line items only for what applies. Each: item name, cost (number), reason (specific to this property age/era). Items to consider: roof, hvac, kitchen, bathrooms, flooring, electrical, plumbing, windows, interior_paint, exterior_paint, foundation_check, demo_cleanup.

RISK FLAGS — flag ALL that apply with property-specific detail:
- Pre-1978: lead paint
- Pre-1950: knob-and-tube wiring, galvanized plumbing
- Pre-1980: asbestos
- Fire/flood history
- Low tax anomaly
- Long ownership (20+ yrs = probate risk)
- Last sale far below market = title risk
- Flood zone
- Foundation age risk
- Unpermitted work
- Market softness
- Vacant/abandoned indicators
Each: flag, severity (high/medium/low), detail (2 sentences).

IMPORTANT FOR VALID JSON:
- No trailing commas
- No newlines inside string values
- No special characters in strings
- Keep all string values on one line

Return this exact shape (numbers are examples only):
{"arv":120000,"repairs":45000,"mao_pct":70,"mao":39000,"my_offer":29000,"end_buyer_offer":39000,"assignment_fee":10000,"sqft":1418,"beds":3,"baths":1.5,"year_built":1943,"repair_tier":"Heavy rehab","repair_breakdown":[{"item":"Roof replacement","cost":8500,"reason":"1943 build likely at end of life"},{"item":"HVAC system","cost":6000,"reason":"Pre-1950 no central HVAC"}],"comps":[{"address":"1711 Floyd Rd Columbus GA 31907","beds":3,"baths":1,"sqft":950,"sold_price":100000,"sold_date":"Dec 2024","distance_miles":0.7,"condition":"Renovated","note":"Full reno kitchen bath LVP","zillow_url":"https://www.zillow.com/homes/1711-Floyd-Rd-Columbus-GA_rb/","redfin_url":"https://www.redfin.com/GA/Columbus/1711-Floyd-Rd-31907"}],"risk_flags":[{"flag":"Knob-and-tube wiring","severity":"high","detail":"Built 1943. Pre-1950 homes frequently have original wiring. Budget $4K-$8K for full electrical upgrade."}],"comp_summary":"4 comps within ${radiusMiles}mi sold last ${monthsBack} months range $100K-$122K. ARV $120K.","deal_rating":"Moderate","deal_rating_reason":"Numbers work at $29K but margin is tight if repairs run over."}`

export async function analyzeDeal({ address, maoPct, radiusMiles, monthsBack }) {
  const userMsg = `Analyze this property. MAO: ${maoPct}%. Comps within ${radiusMiles}mi sold last ${monthsBack} months.\n\nAddress: ${address}\n\nReturn ONLY the JSON object.`

  const resp = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: buildPrompt(radiusMiles, monthsBack),
      messages: [{ role: 'user', content: userMsg }],
    }),
  })

  const data = await resp.json()
  if (!resp.ok) throw new Error(data?.error?.message || `API error ${resp.status}`)

  const text = (data.content || [])
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')
    .trim()

  const stripped = text
    .replace(/^```[a-z]*\n?/i, '')
    .replace(/\n?```$/i, '')
    .trim()

  const match = stripped.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON in response. Please try again.')

  const cleaned = match[0]
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')

  const parsed = JSON.parse(cleaned)

  const required = ['arv', 'repairs', 'mao', 'my_offer', 'end_buyer_offer', 'assignment_fee']
  for (const f of required) {
    if (parsed[f] === undefined) throw new Error(`Missing field: ${f}`)
  }

  return parsed
}

export function recalcWithMao(result, maoPct) {
  const mao = Math.round(result.arv * (maoPct / 100) - result.repairs)
  const gap = (result.end_buyer_offer || result.mao) - (result.my_offer || 0)
  return {
    ...result,
    mao_pct: maoPct,
    mao,
    my_offer: mao - gap,
    end_buyer_offer: mao,
    assignment_fee: gap,
  }
}
