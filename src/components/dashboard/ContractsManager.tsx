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
  property_type: string;
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
    property_type: 'Apartamento',
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
      property_type: contract.property_type,
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

      // Update local state immediately
      setContracts((prev) => prev.filter((contract) => contract.id !== id));

      toast({
        title: 'Contrato excluído',
        description: 'O contrato foi excluído com sucesso',
      });
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
      property_type: 'Apartamento',
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

  const propertyTypes = ['Loja', 'Casa', 'Apartamento', 'Galpão'];

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'Loja':
        return '🏪';
      case 'Casa':
        return '🏠';
      case 'Apartamento':
        return '🏢';
      case 'Galpão':
        return '🏭';
      default:
        return '🏢';
    }
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
            {/* Contract Name and Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div>
                <Label htmlFor="property_type">Tipo de Imóvel</Label>
                <select
                  id="property_type"
                  value={formData.property_type}
                  onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  {propertyTypes.map((type) => (
                    <option key={type} value={type}>
                      {getPropertyTypeIcon(type)} {type}
                    </option>
                  ))}
                </select>
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

      {/* Contracts Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
        {contracts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <i className="ri-file-list-3-line text-6xl text-muted-foreground mb-4"></i>
            <p className="text-lg text-muted-foreground">Nenhum contrato cadastrado</p>
          </div>
        ) : (
          contracts.map((contract) => (
            <div
              key={contract.id}
              className="bg-card border border-border rounded-xl overflow-hidden hover-scale transition-all"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{getPropertyTypeIcon(contract.property_type)}</span>
                    <div>
                      <h3 className="font-bold text-lg">{contract.name}</h3>
                      <p className="text-sm text-muted-foreground">{contract.property_type}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <i className="ri-map-pin-line text-primary mt-0.5"></i>
                    <span className="flex-1">{contract.property_address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <i className="ri-user-line text-primary"></i>
                    <span>Inquilino: <strong>{contract.tenant_name}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <i className="ri-home-4-line text-primary"></i>
                    <span>Proprietário: <strong>{contract.owner_name}</strong></span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Valor do Aluguel</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(contract.rent_value)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Vencimento</span>
                    <span className="font-medium">Dia {contract.property_due_day}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-muted-foreground">Taxa Admin</span>
                    <span className="font-medium">{contract.admin_fee_percentage}%</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleEdit(contract)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
                  >
                    <i className="ri-edit-line"></i>
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(contract.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-all"
                  >
                    <i className="ri-delete-bin-line"></i>
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
