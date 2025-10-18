import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, UserCog } from 'lucide-react';

interface UserRole {
  user_id: string;
  role: 'admin' | 'user';
  email?: string;
}

interface Permission {
  id: number;
  user_id: string;
  resource: string;
  action: string;
}

const RESOURCES = [
  'ingredients',
  'recipe_types',
  'recipes',
  'order_items',
  'users',
  'permissions',
  'daily_ingredient_summary',
];

const ACTIONS = ['create', 'read', 'update', 'delete', 'assign', 'revoke'];

export default function Permissions() {
  const [users, setUsers] = useState<UserRole[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchPermissions(selectedUserId);
    }
  }, [selectedUserId]);

  const fetchUsers = async () => {
    try {
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const userIds = rolesData?.map((r) => r.user_id) || [];
      if (userIds.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

      if (authError) throw authError;

      const usersWithEmails = (rolesData || []).map((role) => {
        const authUser = authData?.users?.find((u: any) => u.id === role.user_id);
        return {
          ...role,
          email: authUser?.email || 'Unknown',
        };
      });

      setUsers(usersWithEmails);
      if (usersWithEmails.length > 0 && !selectedUserId) {
        setSelectedUserId(usersWithEmails[0].user_id);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setPermissions(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;
      toast({ title: 'Success', description: 'User role updated successfully.' });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleGrantPermission = async (resource: string, action: string) => {
    if (!selectedUserId) return;

    try {
      const { error } = await supabase
        .from('user_permissions')
        .insert([{ user_id: selectedUserId, resource, action }]);

      if (error) throw error;
      toast({ title: 'Success', description: 'Permission granted successfully.' });
      fetchPermissions(selectedUserId);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRevokePermission = async (permissionId: number) => {
    try {
      const { error } = await supabase
        .from('user_permissions')
        .delete()
        .eq('id', permissionId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Permission revoked successfully.' });
      if (selectedUserId) fetchPermissions(selectedUserId);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const selectedUser = users.find((u) => u.user_id === selectedUserId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Permissions</h1>
        <p className="text-muted-foreground">Manage user roles and granular permissions</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              User Roles
            </CardTitle>
            <CardDescription>Manage user role assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value: 'admin' | 'user') =>
                              handleRoleChange(user.user_id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Granular Permissions
            </CardTitle>
            <CardDescription>
              {selectedUser
                ? `Permissions for ${selectedUser.email}`
                : 'Select a user to manage permissions'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {users.length > 0 && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select User</label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.user_id} value={user.user_id}>
                          {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedUser?.role === 'admin' ? (
                  <div className="text-sm text-muted-foreground">
                    Admins have full access to all resources.
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Current Permissions</label>
                      <div className="flex flex-wrap gap-2">
                        {permissions.length === 0 ? (
                          <span className="text-sm text-muted-foreground">
                            No permissions granted
                          </span>
                        ) : (
                          permissions.map((perm) => (
                            <Badge
                              key={perm.id}
                              variant="secondary"
                              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => handleRevokePermission(perm.id)}
                            >
                              {perm.resource}:{perm.action} ×
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Grant New Permission</label>
                      <div className="grid grid-cols-2 gap-2">
                        {RESOURCES.map((resource) =>
                          ACTIONS.map((action) => (
                            <Button
                              key={`${resource}-${action}`}
                              variant="outline"
                              size="sm"
                              onClick={() => handleGrantPermission(resource, action)}
                              className="text-xs"
                            >
                              {resource}:{action}
                            </Button>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
