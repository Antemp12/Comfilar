"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/ui/primitives/card";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/ui/primitives/tabs";

export default function SiteSettingsPage() {
  const [loginImage, setLoginImage] = useState("");
  const [adminImage, setAdminImage] = useState("");
  const [funcionarioImage, setFuncionarioImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [loginRes, adminRes, funcRes] = await Promise.all([
        fetch("/api/admin/settings?key=login_background_image"),
        fetch("/api/admin/settings?key=admin_background_image"),
        fetch("/api/admin/settings?key=funcionario_background_image"),
      ]);

      if (loginRes.ok) {
        const data = await loginRes.json();
        setLoginImage(data.data?.value || "https://i.etsystatic.com/20800859/r/il/31ce6c/2784722638/il_570xN.2784722638_62jx.jpg");
      }

      if (adminRes.ok) {
        const data = await adminRes.json();
        setAdminImage(data.data?.value || "https://i.etsystatic.com/20800859/r/il/31ce6c/2784722638/il_570xN.2784722638_62jx.jpg");
      }

      if (funcRes.ok) {
        const data = await funcRes.json();
        setFuncionarioImage(data.data?.value || "https://i.etsystatic.com/20800859/r/il/31ce6c/2784722638/il_570xN.2784722638_62jx.jpg");
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const promises = [
        fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: "login_background_image",
            value: loginImage,
          }),
        }),
        fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: "admin_background_image",
            value: adminImage,
          }),
        }),
        fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: "funcionario_background_image",
            value: funcionarioImage,
          }),
        }),
      ];

      const results = await Promise.all(promises);
      
      if (results.every((res) => res.ok)) {
        toast.success("Configurações guardadas com sucesso!");
      } else {
        toast.error("Erro ao guardar algumas configurações");
      }
    } catch (error) {
      console.error("Erro ao guardar:", error);
      toast.error("Erro ao guardar configurações");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>A carregar...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configurações do Site</h1>
        <p className="text-muted-foreground mt-2">
          Gerir imagens de fundo para diferentes tipos de utilizadores
        </p>
      </div>

      <Tabs defaultValue="cliente" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cliente">Cliente</TabsTrigger>
          <TabsTrigger value="funcionario">Funcionário</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>

        <TabsContent value="cliente">
          <Card>
            <CardHeader>
              <CardTitle>Imagem de Fundo - Cliente</CardTitle>
              <CardDescription>
                Imagem que aparece nas páginas de login/registo para clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loginImage">URL da Imagem</Label>
                <Input
                  id="loginImage"
                  type="url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={loginImage}
                  onChange={(e) => setLoginImage(e.target.value)}
                />
              </div>

              {loginImage && (
                <div className="space-y-2">
                  <Label>Pré-visualização</Label>
                  <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                    <img
                      src={loginImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/400x300?text=Erro+ao+carregar+imagem";
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funcionario">
          <Card>
            <CardHeader>
              <CardTitle>Imagem de Fundo - Funcionário</CardTitle>
              <CardDescription>
                Imagem que aparece nas páginas de login/registo para funcionários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="funcionarioImage">URL da Imagem</Label>
                <Input
                  id="funcionarioImage"
                  type="url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={funcionarioImage}
                  onChange={(e) => setFuncionarioImage(e.target.value)}
                />
              </div>

              {funcionarioImage && (
                <div className="space-y-2">
                  <Label>Pré-visualização</Label>
                  <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                    <img
                      src={funcionarioImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/400x300?text=Erro+ao+carregar+imagem";
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle>Imagem de Fundo - Admin</CardTitle>
              <CardDescription>
                Imagem que aparece nas páginas de login/registo para administradores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminImage">URL da Imagem</Label>
                <Input
                  id="adminImage"
                  type="url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={adminImage}
                  onChange={(e) => setAdminImage(e.target.value)}
                />
              </div>

              {adminImage && (
                <div className="space-y-2">
                  <Label>Pré-visualização</Label>
                  <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                    <img
                      src={adminImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/400x300?text=Erro+ao+carregar+imagem";
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Button onClick={handleSave} disabled={saving} size="lg" className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "A guardar..." : "Guardar Todas as Configurações"}
        </Button>
      </div>
    </div>
  );
}
