/**
 * Pipeline/Tender Mappers for Dashboard Context
 *
 * Re-exports tender mappers from types/tender.ts for use in dashboard services
 *
 * Architecture Decision:
 * - Tender domain mappers are defined in types/tender.ts (single source of truth)
 * - This file re-exports them for dashboard-specific use cases
 * - Keeps dashboard services decoupled from tender implementation details
 *
 * Usage in dashboardService.ts:
 * ```ts
 * import { mapTenderDTO, mapTenderDTOs } from './pipelineMappers';
 *
 * const tender = mapTenderDTO(dto);
 * const tenders = mapTenderDTOs(dtos, (err, dto) => {
 *   console.error('Skipping invalid tender:', err);
 * });
 * ```
 *
 * @version 1.0.0
 */

// Re-export tender mappers from types/tender.ts
export {
  mapTenderDTO,
  mapTenderDTOs,
  // Types
  type Tender,
  type TenderDTO,
  type TenderId,
  type TenderStatus,
  type Priority,
  type CurrencyCode,
} from "@/types/tender";

// Re-export validation utilities (if needed in services)
export {
  isValidTenderStatus,
  isValidPriority,
  isValidCurrency,
} from "@/types/tender";
