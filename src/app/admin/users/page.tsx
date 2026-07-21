"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "~/ui/primitives/button";
import { Input } from "~/ui/primitives/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/ui/primitives/table";
import { Card, CardContent, CardHeader } from "~/ui/primitives/card";
import { Badge } from "~/ui/primitives/badge";
import { Trash2, Edit, Search, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/ui/primitives/dialog";
import { TablePagination } from "~/ui/components/table-pagination";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "funcionario" | "cliente";
  status: "ativo" | "inativo";
  createdAt: string;
  company?: string;
  phone?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<"admin" | "funcionario" | "cliente">("cliente");
  const [newFuncionario, setNewFuncionario] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    company: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json() as any;
        // A API retorna { success: true, users: [...] }
        const usersList = data.users || data.data || [];
        setUsers(usersList.map((u: any) => ({
          id: u.id,
          name: u.name || "",
          email: u.email || "",
          role: u.type || "cliente",
          status: "ativo",
          createdAt: u.registrationDate || new Date().toISOString(),
          company: u.company || "",
        })));
      }
    } catch (error) {
      console.error("Erro ao carregar utilizadores:", error);
      toast.error("Erro ao carregar utilizadores");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFuncionario = async () => {
    if (!newFuncionario.name || !newFuncionario.email || !newFuncionario.password) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newFuncionario,
          role: "funcionario",
          status: "ativo",
        }),
      });

      if (res.ok) {
        const data = await res.json() as any;
        // A API retorna { success: true, user: {...} }
        const newUser = data.user || data.data;
        const transformedUser: User = {
          id: newUser.id,
          name: newUser.name || "",
          email: newUser.email || "",
          role: newUser.type || "funcionario",
          status: "ativo",
          createdAt: new Date().toISOString(),
          company: newFuncionario.company || "",
        };
        setUsers([...users, transformedUser]);
        setNewFuncionario({
          name: "",
          email: "",
          password: "",
          phone: "",
          company: "",
        });
        setShowCreateDialog(false);
        toast.success("Funcionário criado com sucesso");
        await fetchUsers();
      } else {
        const error = await res.text();
        toast.error("Erro ao criar funcionário: " + error);
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao criar funcionário");
    } finally {
      setIsCreating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers(users.filter((u) => u.id !== deletingUser.id));
        toast.success("Utilizador eliminado com sucesso");
        setDeletingUser(null);
      } else {
        toast.error("Erro ao eliminar utilizador");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao eliminar utilizador");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditRole = (user: User) => {
    setEditingUser(user);
    setEditingRole(user.role);
    setShowEditDialog(true);
  };

  const handleSaveRole = async () => {
    if (!editingUser) return;

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: editingRole }),
      });

      if (res.ok) {
        setUsers(
          users.map((u) =>
            u.id === editingUser.id ? { ...u, role: editingRole } : u
          )
        );
        setShowEditDialog(false);
        setEditingUser(null);
        toast.success("Cargo atualizado com sucesso");
      } else {
        toast.error("Erro ao atualizar cargo");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao atualizar cargo");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(
    () => filteredUsers.slice((page - 1) * pageSize, page * pageSize),
    [filteredUsers, page, pageSize],
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const roleColors = {
    admin: "bg-red-100 text-red-800",
    funcionario: "bg-blue-100 text-blue-800",
    cliente: "bg-green-100 text-green-800",
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: "Administrador",
      funcionario: "Funcionário",
      cliente: "Cliente",
    };
    return labels[role as keyof typeof labels] || role;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Utilizadores</h1>
          <p className="mt-1 text-sm text-gray-600">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Utilizadores</h1>
          <p className="mt-1 text-sm text-gray-600">
            {filteredUsers.length} utilizador(es) registado(s)
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Funcionário</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo funcionário
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <Input
                  placeholder="Nome completo"
                  value={newFuncionario.name}
                  onChange={(e) =>
                    setNewFuncionario({
                      ...newFuncionario,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  type="email"
                  placeholder="email@comfilar.pt"
                  value={newFuncionario.email}
                  onChange={(e) =>
                    setNewFuncionario({
                      ...newFuncionario,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Palavra-passe *
                </label>
                <Input
                  type="password"
                  placeholder="Palavra-passe temporária"
                  value={newFuncionario.password}
                  onChange={(e) =>
                    setNewFuncionario({
                      ...newFuncionario,
                      password: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Telefone
                </label>
                <Input
                  placeholder="+351 9xx xxx xxx"
                  value={newFuncionario.phone}
                  onChange={(e) =>
                    setNewFuncionario({
                      ...newFuncionario,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Empresa</label>
                <Input
                  placeholder="Nome da empresa"
                  value={newFuncionario.company}
                  onChange={(e) =>
                    setNewFuncionario({
                      ...newFuncionario,
                      company: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateFuncionario}
                  disabled={isCreating}
                >
                  {isCreating ? "A criar..." : "Criar Funcionário"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Pesquisar por nome, email ou empresa..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-gray-500">Nenhum utilizador encontrado</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-sm">{user.email}</TableCell>
                      <TableCell className="text-sm">
                        {user.company || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            roleColors[user.role as keyof typeof roleColors]
                          }
                          variant="outline"
                        >
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "ativo"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {user.status === "ativo"
                            ? "Ativo"
                            : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(user.createdAt).toLocaleDateString("pt-PT")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => handleEditRole(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8"
                            onClick={() => setDeletingUser(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {filteredUsers.length > 0 && (
            <div className="mt-4">
              <TablePagination
                page={page}
                totalPages={totalPages}
                pageSize={pageSize}
                total={filteredUsers.length}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                itemLabel="utilizador(es)"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição de Cargo */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cargo de {editingUser?.name}</DialogTitle>
            <DialogDescription>
              Altere o cargo do utilizador
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Cargo</label>
              <select
                value={editingRole}
                onChange={(e) =>
                  setEditingRole(
                    e.target.value as "admin" | "funcionario" | "cliente"
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cliente">Cliente</option>
                <option value="funcionario">Funcionário</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveRole}>
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Eliminação */}
      <Dialog
        open={deletingUser !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingUser(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar utilizador</DialogTitle>
            <DialogDescription>
              Tem a certeza que deseja eliminar{" "}
              <span className="font-medium text-foreground">
                {deletingUser?.name || deletingUser?.email}
              </span>
              ? Esta ação é permanente e não pode ser revertida.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeletingUser(null)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "A eliminar..." : "Eliminar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
