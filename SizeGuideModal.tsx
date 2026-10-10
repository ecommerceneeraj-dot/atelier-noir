import React from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryLabel?: string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  categoryLabel = 'All Architectural Garments',
}) => {
  if (!isOpen) return null;

  const upperBodyMeasurements = [
    { size: 'XS', chestCm: '108', shoulderCm: '53', lengthCm: '69', sleeveCm: '23 / 61' },
    { size: 'S', chestCm: '114', shoulderCm: '55', lengthCm: '71', sleeveCm: '24 / 62' },
    { size: 'M', chestCm: '120', shoulderCm: '57', lengthCm: '73', sleeveCm: '25 / 64' },
    { size: 'L', chestCm: '126', shoulderCm: '59', lengthCm: '75', sleeveCm: '26 / 65' },
    { size: 'XL', chestCm: '132', shoulderCm: '61', lengthCm: '77', sleeveCm: '27 / 67' },
  ];

  const trouserMeasurements = [
    { size: 'XS (28)', waistCm: '72', hipCm: '104', thighCm: '68', outseamCm: '105' },
    { size: 'S (30)', waistCm: '77', hipCm: '109', thighCm: '70', outseamCm: '107' },
    { size: 'M (32)', waistCm: '82', hipCm: '114', thighCm: '73', outseamCm: '109' },
    { size: 'L (34)', waistCm: '87', hipCm: '119', thighCm: '76', outseamCm: '111' },
    { size: 'XL (36)', waistCm: '92', hipCm: '124', thighCm: '79', outseamCm: '113' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#121215] border border-white/15 p-6 md:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#C5A880]">
              <Ruler className="w-3.5 h-3.5" />
              <span>Atelier Pattern Specifications</span>
            </div>
            <h2
              id="size-guide-title"
              className="mt-1 font-display text-2xl text-[#F5F2EB]"
            >
              Garment Size & Proportion Guide
            </h2>
            <p className="mt-1 text-xs text-[#9A9A9E]">
              Reference for: {categoryLabel} · All measurements in centimeters (cm)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close size guide"
            className="p-2 text-[#9A9A9E] hover:text-[#F5F2EB] border border-white/10 hover:border-white/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#F5F2EB] mb-3">
              01. Tops, Shirts, Hoodies & Outerwear (Garment Flat Measurements)
            </h3>
            <div className="overflow-x-auto border border-white/10">
              <table className="w-full text-left text-xs font-mono tabular-nums">
                <thead className="bg-white/[0.04] text-[#9A9A9E] uppercase border-b border-white/10">
                  <tr>
                    <th className="py-2.5 px-4">Size</th>
                    <th className="py-2.5 px-4">Chest (Circumference)</th>
                    <th className="py-2.5 px-4">Shoulder Width</th>
                    <th className="py-2.5 px-4">Back Length</th>
                    <th className="py-2.5 px-4">Sleeve (Short / Long)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-[#F5F2EB]">
                  {upperBodyMeasurements.map((row) => (
                    <tr key={row.size} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-4 font-semibold text-[#C5A880]">{row.size}</td>
                      <td className="py-2.5 px-4">{row.chestCm} cm</td>
                      <td className="py-2.5 px-4">{row.shoulderCm} cm</td>
                      <td className="py-2.5 px-4">{row.lengthCm} cm</td>
                      <td className="py-2.5 px-4">{row.sleeveCm} cm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#F5F2EB] mb-3">
              02. Tailored & Wide-Leg Trousers
            </h3>
            <div className="overflow-x-auto border border-white/10">
              <table className="w-full text-left text-xs font-mono tabular-nums">
                <thead className="bg-white/[0.04] text-[#9A9A9E] uppercase border-b border-white/10">
                  <tr>
                    <th className="py-2.5 px-4">Size</th>
                    <th className="py-2.5 px-4">Waist</th>
                    <th className="py-2.5 px-4">Seat / Hip</th>
                    <th className="py-2.5 px-4">Thigh Width</th>
                    <th className="py-2.5 px-4">Total Outseam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-[#F5F2EB]">
                  {trouserMeasurements.map((row) => (
                    <tr key={row.size} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-4 font-semibold text-[#C5A880]">{row.size}</td>
                      <td className="py-2.5 px-4">{row.waistCm} cm</td>
                      <td className="py-2.5 px-4">{row.hipCm} cm</td>
                      <td className="py-2.5 px-4">{row.thighCm} cm</td>
                      <td className="py-2.5 px-4">{row.outseamCm} cm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-white/[0.03] border border-white/[0.08] text-xs text-[#9A9A9E] leading-relaxed">
            <strong className="text-[#F5F2EB] uppercase tracking-wider block mb-1">
              Architectural Fit Note
            </strong>
            ATELIER NOIR garments are drafted with intentional structural volume and dropped shoulders. Select your customary size for the signature editorial silhouette, or size down one step for a closer tailored fit.
          </div>
        </div>
      </div>
    </div>
  );
};
