import { useState, useEffect } from 'react';
import { storage } from '@/lib/localStorage';
import { Contract } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import 'remixicon/fonts/remixicon.css';

export function ContractsManager() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Contract, 'id'>>({
    name: '',
    owner: { name: '', document: '' },
    tenant: { name: '', document: '' },
    property: { address: '', iptu: '', dueDay: 1 },
    contract: {
      startDate: '',
      endDate: '',
      rentValue: 0,
      iptuValue: 0,
      adminFeePercentage: 0,
    },
  });

  useEffect(() => {
    setContracts(storage.contracts.get());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      const updated = contracts.map((c) =>
        c.id === editingId ? { ...formData, id: editingId } : c
      );
      setContracts(updated);
      storage.contracts.set(updated);
    } else {
      const newContract = { ...formData, id: Date.now().toString() };
      const updated = [...contracts, newContract];
      setContracts(updated);
      storage.contracts.set(updated);
    }

    resetForm();
  };

  const handleEdit = (contract: Contract) => {
    setFormData(contract);
    setEditingId(contract.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este contrato?')) {
      const updated = contracts.filter((c) => c.id !== id);
      setContracts(updated);
      storage.contracts.set(updated);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      owner: { name: '', document: '' },
      tenant: { name: '', document: '' },
      property: { address: '', iptu: '', dueDay: 1 },
      contract: {
        startDate: '',
        endDate: '',
        rentValue: 0,
        iptuValue: 0,
        adminFeePercentage: 0,
      },
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fadeIn">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <i className="ri-file-list-3-line text-primary"></i>
          Gestão de Contratos
        </h2>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <i className="ri-add-line"></i>
          Novo Contrato
        </Button>
      </div>

      {isFormOpen && (
        <div className="bg-card p-6 rounded-xl border border-border animate-slideDown">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar Contrato' : 'Novo Contrato'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contract Name */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="contractName">Nome/Identificação do Contrato</Label>
                <Input
                  id="contractName"
                  required
                  placeholder="Ex: Casa Jardim América, Apto 301 Centro, etc."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* Owner */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Proprietário</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ownerName">Nome Completo</Label>
                  <Input
                    id="ownerName"
                    required
                    value={formData.owner.name}
                    onChange={(e) => setFormData({ ...formData, owner: { ...formData.owner, name: e.target.value } })}
                  />
                </div>
                <div>
                  <Label htmlFor="ownerDoc">CPF/CNPJ</Label>
                  <Input
                    id="ownerDoc"
                    required
                    value={formData.owner.document}
                    onChange={(e) => setFormData({ ...formData, owner: { ...formData.owner, document: e.target.value } })}
                  />
                </div>
              </div>
            </div>

            {/* Tenant */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Inquilino</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tenantName">Nome Completo</Label>
                  <Input
                    id="tenantName"
                    required
                    value={formData.tenant.name}
                    onChange={(e) => setFormData({ ...formData, tenant: { ...formData.tenant, name: e.target.value } })}
                  />
                </div>
                <div>
                  <Label htmlFor="tenantDoc">CPF/CNPJ</Label>
                  <Input
                    id="tenantDoc"
                    required
                    value={formData.tenant.document}
                    onChange={(e) => setFormData({ ...formData, tenant: { ...formData.tenant, document: e.target.value } })}
                  />
                </div>
              </div>
            </div>

            {/* Property */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Imóvel</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="address">Endereço Completo</Label>
                  <Input
                    id="address"
                    required
                    value={formData.property.address}
                    onChange={(e) => setFormData({ ...formData, property: { ...formData.property, address: e.target.value } })}
                  />
                </div>
                <div>
                  <Label htmlFor="iptu">Inscrição IPTU</Label>
                  <Input
                    id="iptu"
                    required
                    value={formData.property.iptu}
                    onChange={(e) => setFormData({ ...formData, property: { ...formData.property, iptu: e.target.value } })}
                  />
                </div>
                <div>
                  <Label htmlFor="dueDay">Dia de Vencimento</Label>
                  <Input
                    id="dueDay"
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={formData.property.dueDay}
                    onChange={(e) => setFormData({ ...formData, property: { ...formData.property, dueDay: Number(e.target.value) } })}
                  />
                </div>
              </div>
            </div>

            {/* Contract */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Dados do Contrato</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Data de Início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    required
                    value={formData.contract.startDate}
                    onChange={(e) => setFormData({ ...formData, contract: { ...formData.contract, startDate: e.target.value } })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Data de Vencimento</Label>
                  <Input
                    id="endDate"
                    type="date"
                    required
                    value={formData.contract.endDate}
                    onChange={(e) => setFormData({ ...formData, contract: { ...formData.contract, endDate: e.target.value } })}
                  />
                </div>
                <div>
                  <Label htmlFor="rentValue">Valor do Aluguel (R$)</Label>
                  <Input
                    id="rentValue"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.contract.rentValue}
                    onChange={(e) => setFormData({ ...formData, contract: { ...formData.contract, rentValue: Number(e.target.value) } })}
                  />
                </div>
                <div>
                  <Label htmlFor="iptuValue">Valor do IPTU (R$)</Label>
                  <Input
                    id="iptuValue"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.contract.iptuValue}
                    onChange={(e) => setFormData({ ...formData, contract: { ...formData.contract, iptuValue: Number(e.target.value) } })}
                  />
                </div>
                <div>
                  <Label htmlFor="adminFee">Taxa de Administração (%)</Label>
                  <Input
                    id="adminFee"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    value={formData.contract.adminFeePercentage}
                    onChange={(e) => setFormData({ ...formData, contract: { ...formData.contract, adminFeePercentage: Number(e.target.value) } })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit" className="hover:scale-105 transition-transform">
                {editingId ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Contracts List */}
      <div className="bg-card rounded-xl border border-border overflow-hidden animate-slideUp">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Identificação</th>
                <th className="px-4 py-3 text-left text-sm font-medium hidden sm:table-cell">Endereço</th>
                <th className="px-4 py-3 text-left text-sm font-medium hidden sm:table-cell">Proprietário</th>
                <th className="px-4 py-3 text-left text-sm font-medium hidden lg:table-cell">Inquilino</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Aluguel</th>
                <th className="px-4 py-3 text-left text-sm font-medium hidden lg:table-cell">Taxa Admin</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum contrato cadastrado
                  </td>
                </tr>
              ) : (
                contracts.map((contract) => (
                  <tr key={contract.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold">{contract.name}</td>
                    <td className="px-4 py-3 text-sm hidden sm:table-cell">{contract.property.address}</td>
                    <td className="px-4 py-3 text-sm hidden sm:table-cell">{contract.owner.name}</td>
                    <td className="px-4 py-3 text-sm hidden lg:table-cell">{contract.tenant.name}</td>
                    <td className="px-4 py-3 text-sm font-medium">{formatCurrency(contract.contract.rentValue)}</td>
                    <td className="px-4 py-3 text-sm hidden lg:table-cell">{contract.contract.adminFeePercentage}%</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(contract)}
                          className="p-2 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all"
                          title="Editar"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(contract.id)}
                          className="p-2 hover:bg-destructive hover:text-destructive-foreground rounded-lg transition-all"
                          title="Excluir"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
