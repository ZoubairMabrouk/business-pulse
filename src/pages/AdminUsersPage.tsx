import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpDown,
  CheckCircle2,
  Eye,
  KeyRound,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users as UsersIcon,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  useDeleteUser,
  useSetUserStatus,
  useUsersList,
} from "@/hooks/useUsers";
import type { ApiError } from "@/services/authService";
import type { User } from "@/types/user";
import { UserFormDialog } from "@/components/users/UserFormDialog";
import { UserDetailsDialog } from "@/components/users/UserDetailsDialog";
import { ResetPasswordDialog } from "@/components/users/ResetPasswordDialog";

function fmtDate(d?: string) {
  if (!d) return "—";
  try {
    return format(new Date(d), "dd/MM/yyyy");
  } catch {
    return "—";
  }
}

function displayName(u: User) {
  return (
    u.fullName ||
    [u.firstName, u.lastName].filter(Boolean).join(" ") ||
    u.username ||
    u.email
  );
}

function initials(u: User) {
  const name = displayName(u);
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<User | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const params = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: search.trim() || undefined,
      role,
      status,
      sortBy,
      sortDir,
    }),
    [page, search, role, status, sortBy, sortDir]
  );

  const { data, isLoading, isError, error, isFetching, refetch } =
    useUsersList(params);
  const setStatusMut = useSetUserStatus();
  const deleteMut = useDeleteUser();

  // Client-side fallback when backend doesn't filter/sort/paginate.
  const processed = useMemo(() => {
    const all = data?.items ?? [];
    const lower = search.trim().toLowerCase();
    let filtered = all.filter((u) => {
      if (role !== "all" && (u.role || "").toLowerCase() !== role.toLowerCase()) return false;
      if (status !== "all" && (u.status || "").toLowerCase() !== status.toLowerCase()) return false;
      if (lower) {
        const hay = [
          displayName(u),
          u.username,
          u.email,
          u.firstName,
          u.lastName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(lower)) return false;
      }
      return true;
    });
    filtered = [...filtered].sort((a, b) => {
      const av = (a as unknown as Record<string, string>)[sortBy] ?? "";
      const bv = (b as unknown as Record<string, string>)[sortBy] ?? "";
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return filtered;
  }, [data, search, role, status, sortBy, sortDir]);

  const totalFromServer = data?.total ?? processed.length;
  // If server returns paged, items === processed. Else, slice client-side.
  const serverPaged = (data?.items?.length ?? 0) <= PAGE_SIZE && totalFromServer > (data?.items?.length ?? 0);
  const pageItems = serverPaged ? processed : processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const total = serverPaged ? totalFromServer : processed.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function toggleSort(field: string) {
    if (sortBy === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(field);
      setSortDir("asc");
    }
  }

  async function handleToggleStatus(u: User) {
    const next = u.status === "Active" ? "Inactive" : "Active";
    try {
      await setStatusMut.mutateAsync({ id: u.id, status: next });
      toast.success(`Compte ${next === "Active" ? "activé" : "désactivé"}`);
    } catch (e) {
      toast.error((e as ApiError)?.message || "Action impossible");
    }
  }

  async function handleDelete() {
    if (!selected) return;
    try {
      await deleteMut.mutateAsync(selected.id);
      toast.success("Utilisateur supprimé");
      setDeleteOpen(false);
      setSelected(null);
    } catch (e) {
      toast.error((e as ApiError)?.message || "Suppression impossible");
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Accueil</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Administration · Utilisateurs</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Utilisateurs</h1>
            <p className="text-sm text-muted-foreground">
              Gérez les comptes, rôles et accès.
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            setFormMode("create");
            setSelected(null);
            setFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="relative md:col-span-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher par nom, username ou email…"
            className="pl-9"
          />
        </div>
        <div className="md:col-span-3">
          <Select value={role} onValueChange={(v) => { setRole(v); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="User">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-3">
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="Active">Actif</SelectItem>
              <SelectItem value="Inactive">Inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>
                  <button
                    onClick={() => toggleSort("lastName")}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    Nom complet <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead>Username</TableHead>
                <TableHead>
                  <button
                    onClick={() => toggleSort("email")}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    Email <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>
                  <button
                    onClick={() => toggleSort("createdAt")}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    Créé le <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-destructive">
                    {(error as ApiError)?.message || "Erreur de chargement"}
                    <div className="mt-3">
                      <Button size="sm" variant="outline" onClick={() => refetch()}>
                        Réessayer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : pageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <UsersIcon className="w-10 h-10 text-muted-foreground mb-3" />
                      <p className="text-sm font-medium">Aucun utilisateur</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ajustez vos filtres ou créez un nouveau compte.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pageItems.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/15 text-primary text-xs font-semibold flex items-center justify-center">
                          {initials(u)}
                        </div>
                        <span className="font-medium">{displayName(u)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.username || "—"}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={(u.role || "").toLowerCase() === "admin" ? "default" : "secondary"}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.status === "Active" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground border border-border">
                          <XCircle className="w-3 h-3" /> Inactif
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{fmtDate(u.createdAt)}</TableCell>
                    <TableCell className="text-muted-foreground">{fmtDate(u.lastLoginAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => { setSelected(u); setDetailsOpen(true); }}>
                            <Eye className="w-4 h-4 mr-2" /> Voir les détails
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelected(u); setFormMode("edit"); setFormOpen(true); }}>
                            <Pencil className="w-4 h-4 mr-2" /> Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(u)}>
                            {u.status === "Active" ? (
                              <><XCircle className="w-4 h-4 mr-2" /> Désactiver</>
                            ) : (
                              <><CheckCircle2 className="w-4 h-4 mr-2" /> Activer</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelected(u); setResetOpen(true); }}>
                            <KeyRound className="w-4 h-4 mr-2" /> Réinitialiser le mot de passe
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => { setSelected(u); setDeleteOpen(true); }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!isLoading && !isError && pageItems.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted-foreground">
            <span>
              {total} résultat{total > 1 ? "s" : ""}
              {isFetching && " · mise à jour…"}
            </span>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Précédent
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <span className="px-3 text-sm">
                    Page {page} / {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Suivant
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        user={formMode === "edit" ? selected : null}
      />
      <UserDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        user={selected}
      />
      <ResetPasswordDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        user={selected}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est définitive. Le compte
              {selected && (
                <> de <span className="font-medium text-foreground">{selected.email}</span></>
              )}{" "}
              sera supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}