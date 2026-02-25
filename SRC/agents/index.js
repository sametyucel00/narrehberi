/**
 * V10.1 Profesör Ajan Orkestrası — Sessiz yönlendirme; kullanıcı ajan adı görmez.
 * V11.1 Acil hizmet (çilingir, su tesisatı) → 0850 + lead kaydı.
 */
import * as SynopsisAgent from './SynopsisAgent';
import * as DateDoctorAgent from './DateDoctorAgent';
import * as ExplorerAgent from './ExplorerAgent';
import { isAcilHizmetQuery } from '../services/LeadService';

const ELITE_KEYWORDS = /derin cast analizi|özel senaryo|ozel senaryo|elite|premium katman/i;

const AGENTS = [
  SynopsisAgent,
  DateDoctorAgent,
  ExplorerAgent,
];

/**
 * Sorguyu uygun profesöre yönlendirir. Kullanıcıya ajan ismi döndürülmez.
 * @param {string} query
 * @param {{ nabizCards: array, location: string }} context
 * @returns {{ source: string, layers: array, signature: string } | { eliteRequired: true, layers: array, signature?: string }}
 */
export function routeAndProcess(query, context = {}) {
  const q = (query || '').trim();

  if (isAcilHizmetQuery(q)) {
    return {
      source: 'Onaylanmış Reçete',
      layers: [
        {
          label: 'Acil Hizmet',
          text: 'Acil hizmet talebiniz alındı. 0850 numarasına yönlendiriliyorsunuz; en kısa sürede size ulaşılacaktır.',
        },
      ],
      signature: null,
      agentId: 'explorer',
      acilHizmetRedirect: true,
      leadQuery: q,
    };
  }

  if (ELITE_KEYWORDS.test(q)) {
    return {
      source: 'Onaylanmış Reçete',
      eliteRequired: true,
      layers: [
        {
          label: null,
          text: 'Bu katman Algoritma tarafından sadece Elite üyeler için onaylanmıştır. Deneyiminizi yükseltmek için üyeliğinizi güncelleyebilirsiniz.',
        },
      ],
      signature: null,
      agentId: null,
    };
  }

  for (const agent of AGENTS) {
    if (agent.canHandle(q)) {
      const { layers, signature } = agent.processQuery(q, context);
      const agentId = agent.SynopsisIdentity?.id ?? agent.DateDoctorIdentity?.id ?? agent.ExplorerIdentity?.id ?? 'explorer';
      return {
        source: 'Onaylanmış Reçete',
        layers,
        signature: signature || null,
        agentId,
      };
    }
  }

  const explorerResult = ExplorerAgent.processQuery(q, context);
  return {
    source: 'Onaylanmış Reçete',
    layers: explorerResult.layers,
    signature: explorerResult.signature,
    agentId: 'explorer',
  };
}

export { SynopsisAgent, DateDoctorAgent, ExplorerAgent };
export const TESCIL_ZAMAN_QUERY = ExplorerAgent.TESCIL_ZAMAN_QUERY;
