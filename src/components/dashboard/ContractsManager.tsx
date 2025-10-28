import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import 'remixicon/fonts/remixicon.css';

interface DBContract {
  id: string;
  name: string;
  owner_name: string;
  owner_document: string;
  tenant_name: string;
  tenant_document: string;
  property_address: string;
  property_iptu: string;
  property_due_day: number;
  start_date: string;
  end_date: string;
  rent_value: number;
  iptu_value: number;
  admin_fee_percentage: number;
}

export function ContractsManager() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [contracts, setContracts] = useState<DBContract[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    owner_name: '',
    owner_document: '',
    tenant_name: '',
    tenant_document: '',
    property_address: '',
    property_iptu: '',
    property_due_day: 1,
    start_date: '',
    end_date: '',
    rent_value: 0,
    iptu_value: 0,
    admin_fee_percentage: 0,
  });

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar contratos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado',
        variant: 'destructive',
      });
      return;
    }

    try {
      const contractData = {
        ...formData,
        user_id: user.id,
      };

      if (editingId) {
        const { error } = await supabase
          .from('contracts')
          .update(contractData)
          .eq('id', editingId);

        if (error) throw error;
        
        toast({
          title: 'Contrato atualizado',
          description: 'O contrato foi atualizado com sucesso',
        });
      } else {
        const { error } = await supabase
          .from('contracts')
          .insert([contractData]);

        if (error) throw error;
        
        toast({
          title: 'Contrato criado',
          description: 'O contrato foi criado com sucesso',
        });
      }

      await fetchContracts();
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar contrato',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (contract: DBContract) => {
    setFormData({
      name: contract.name,
      owner_name: contract.owner_name,
      owner_document: contract.owner_document,
      tenant_name: contract.tenant_name,
      tenant_document: contract.tenant_document,
      property_address: contract.property_address,
      property_iptu: contract.property_iptu,
      property_due_day: contract.property_due_day,
      start_date: contract.start_date,
      end_date: contract.end_date,
      rent_value: contract.rent_value,
      iptu_value: contract.iptu_value,
      admin_fee_percentage: contract.admin_fee_percentage,
    });
    setEditingId(contract.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este contrato?')) return;

    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Contrato excluído',
        description: 'O contrato foi excluído com sucesso',
      });

      await fetchContracts();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir contrato',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      owner_name: '',
      owner_document: '',
      tenant_name: '',
      tenant_document: '',
      property_address: '',
      property_iptu: '',
      property_due_day: 1,
      start_date: '',
      end_date: '',
      rent_value: 0,
      iptu_value: 0,
      admin_fee_percentage: 0,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Carregando contratos...</p>
      </div>
    );
  }

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
                    value={formData.owner_name}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="ownerDoc">CPF/CNPJ</Label>
                  <Input
                    id="ownerDoc"
                    required
                    value={formData.owner_document}
                    onChange={(e) => setFormData({ ...formData, owner_document: e.target.value })}
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
                    value={formData.tenant_name}
                    onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="tenantDoc">CPF/CNPJ</Label>
                  <Input
                    id="tenantDoc"
                    required
                    value={formData.tenant_document}
                    onChange={(e) => setFormData({ ...formData, tenant_document: e.target.value })}
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
                    value={formData.property_address}
                    onChange={(e) => setFormData({ ...formData, property_address: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="iptu">Inscrição IPTU</Label>
                  <Input
                    id="iptu"
                    required
                    value={formData.property_iptu}
                    onChange={(e) => setFormData({ ...formData, property_iptu: e.target.value })}
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
                    value={formData.property_due_day}
                    onChange={(e) => setFormData({ ...formData, property_due_day: Number(e.target.value) })}
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
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Data de Vencimento</Label>
                  <Input
                    id="endDate"
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
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
                    value={formData.rent_value}
                    onChange={(e) => setFormData({ ...formData, rent_value: Number(e.target.value) })}
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
                    value={formData.iptu_value}
                    onChange={(e) => setFormData({ ...formData, iptu_value: Number(e.target.value) })}
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
                    value={formData.admin_fee_percentage}
                    onChange={(e) => setFormData({ ...formData, admin_fee_percentage: Number(e.target.value) })}
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
                    <td className="px-4 py-3 text-sm hidden sm:table-cell">{contract.property_address}</td>
                    <td className="px-4 py-3 text-sm hidden sm:table-cell">{contract.owner_name}</td>
                    <td className="px-4 py-3 text-sm hidden lg:table-cell">{contract.tenant_name}</td>
                    <td className="px-4 py-3 text-sm font-medium">{formatCurrency(contract.rent_value)}</td>
                    <td className="px-4 py-3 text-sm hidden lg:table-cell">{contract.admin_fee_percentage}%</td>
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
