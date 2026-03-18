import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface InsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: InsuranceFormData) => void;
  initialData?: InsuranceFormData | null;
  isLoading?: boolean;
}

export interface InsuranceFormData {
  id?: string;
  type: string;
  provider: string;
  premium: number;
  startDate: string;
  endDate?: string;
  renewalDate: string;
  reminderDays: number;
  emailReminder: boolean;
  status: string;
  coverage: string;
  policyNumber: string;
}

export default function InsuranceModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isLoading,
}: InsuranceModalProps) {
  const [formData, setFormData] = useState<InsuranceFormData>({
    type: 'car',
    provider: '',
    premium: 0,
    startDate: new Date().toISOString().split('T')[0],
    renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reminderDays: 30,
    emailReminder: true,
    status: 'active',
    coverage: '',
    policyNumber: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        startDate: initialData.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        endDate: initialData.endDate?.split('T')[0] || '',
        renewalDate: initialData.renewalDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? 'Upraviť poistku' : 'Nová poistka'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Typ poistky */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typ poistky *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="car">Autopoisťovka</option>
                <option value="home">Poistenie domácnosti</option>
                <option value="health">Zdravotné poistenie</option>
                <option value="life">Životné poistenie</option>
              </select>
            </div>

            {/* Poisťovňa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poisťovňa *
              </label>
              <input
                type="text"
                name="provider"
                value={formData.provider}
                onChange={handleChange}
                placeholder="napr. Allianz, UNIQA..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {/* Ročná platba */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ročná platba (€) *
              </label>
              <input
                type="number"
                name="premium"
                value={formData.premium}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {/* Číslo zmluvy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Číslo zmluvy *
              </label>
              <input
                type="text"
                name="policyNumber"
                value={formData.policyNumber}
                onChange={handleChange}
                placeholder="napr. POL-2026-123456"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {/* Začiatok poistenia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Začiatok poistenia *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {/* Koniec poistenia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Koniec poistenia
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Dátum obnovenia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dátum obnovenia *
              </label>
              <input
                type="date"
                name="renewalDate"
                value={formData.renewalDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {/* Pripomienka (dni vopred) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pripomienka (dni vopred)
              </label>
              <input
                type="number"
                name="reminderDays"
                value={formData.reminderDays}
                onChange={handleChange}
                min="1"
                max="180"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Dostanete email {formData.reminderDays} dní pred obnovením
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stav poistky
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="active">Aktívna</option>
                <option value="pending">Čaká na aktiváciu</option>
                <option value="expired">Vypršala</option>
                <option value="cancelled">Zrušená</option>
              </select>
            </div>

            {/* Email reminder */}
            <div className="flex items-center space-x-3 pt-6">
              <input
                type="checkbox"
                id="emailReminder"
                name="emailReminder"
                checked={formData.emailReminder}
                onChange={handleChange}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="emailReminder" className="text-sm font-medium text-gray-700">
                Posielať email pripomienky
              </label>
            </div>
          </div>

          {/* Krytie/popis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Krytie/Popis poistenia *
            </label>
            <textarea
              name="coverage"
              value={formData.coverage}
              onChange={handleChange}
              rows={3}
              placeholder="napr. Havarijné + PZP, krytie do €50,000..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Zrušiť
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Ukladám...' : initialData ? 'Uložiť zmeny' : 'Vytvoriť poistku'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
