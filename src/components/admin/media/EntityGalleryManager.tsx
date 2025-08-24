import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Gallery } from '@/features/gallery/types';
import {
  Search,
  Plus,
  Link,
  Unlink,
  Users,
  Building,
  Calendar,
  FileText,
  ShoppingBag,
  BookOpen,
  User,
  RefreshCw,
  Filter,
  ChevronDown,
  Image as ImageIcon,
  ExternalLink,
  Settings,
  ArrowRight,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EntityWithGalleries {
  id: string;
  name: string;
  slug: string;
  type: 'group' | 'event' | 'company' | 'news' | 'marketplace' | 'resource' | 'page' | 'user';
  galleries: Gallery[];
  assignedGalleries: number;
  totalGalleries: number;
  lastUpdated: string;
  status?: string;
  description?: string;
  image?: string;
  logo?: string;
  avatar?: string;
}

const EntityGalleryManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('groups');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<EntityWithGalleries | null>(null);
  const [availableGalleries, setAvailableGalleries] = useState<Gallery[]>([]);

  // Entity type icons
  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'group': return Users;
      case 'event': return Calendar;
      case 'company': return Building;
      case 'news': return FileText;
      case 'marketplace': return ShoppingBag;
      case 'resource': return BookOpen;
      case 'page': return FileText;
      case 'user': return User;
      default: return FileText;
    }
  };

  // Fetch entities with gallery assignments
  const { data: entitiesData, isLoading, refetch } = useQuery({
    queryKey: ['entity-galleries', activeTab, searchTerm],
    queryFn: async (): Promise<EntityWithGalleries[]> => {
      let tableName = '';
      let selectQuery = '';
      
      switch (activeTab) {
        case 'groups':
          tableName = 'groups';
          selectQuery = 'id, name, slug, description, hero_image, created_at';
          break;
        case 'events':
          tableName = 'events';
          selectQuery = 'id, name, slug, description, hero_image, created_at, start_date';
          break;
        case 'companies':
          tableName = 'companies';
          selectQuery = 'id, name, slug, description, logo, created_at';
          break;
        case 'news':
          tableName = 'news';
          selectQuery = 'id, title, slug, excerpt, hero_image, created_at, published';
          break;
        case 'marketplace':
          tableName = 'marketplace_listings';
          selectQuery = 'id, title, slug, description, images, created_at, status';
          break;
        case 'resources':
          tableName = 'resources';
          selectQuery = 'id, title, slug, description, thumbnail, created_at, published';
          break;
        case 'pages':
          tableName = 'pages';
          selectQuery = 'id, title, slug, excerpt, hero_image, created_at';
          break;
        case 'users':
          tableName = 'members';
          selectQuery = 'id, name, email, avatar_url, created_at';
          break;
        default:
          return [];
      }

      let query = supabase.from(tableName).select(selectQuery);

      if (searchTerm) {
        const searchField = activeTab === 'users' ? 'name' : activeTab === 'news' || activeTab === 'marketplace' || activeTab === 'resources' || activeTab === 'pages' ? 'title' : 'name';
        query = query.ilike(searchField, `%${searchTerm}%`);
      }

      const { data: entities, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;

      // For each entity, get their gallery assignments
      const entitiesWithGalleries: EntityWithGalleries[] = await Promise.all(
        (entities || []).map(async (entity) => {
          // Get galleries assigned to this entity
          const { data: galleries } = await supabase
            .from('user_galleries')
            .select('*')
            .eq('owner_type', activeTab.slice(0, -1)) // Remove 's' from end
            .eq('owner_id', entity.id);

          // Get total available galleries for this entity type
          const { count: totalGalleries } = await supabase
            .from('user_galleries')
            .select('*', { count: 'exact', head: true })
            .eq('owner_type', activeTab.slice(0, -1));

          return {
            id: entity.id,
            name: entity.name || entity.title || entity.email,
            slug: entity.slug || entity.id,
            type: activeTab.slice(0, -1) as EntityWithGalleries['type'],
            galleries: galleries || [],
            assignedGalleries: galleries?.length || 0,
            totalGalleries: totalGalleries || 0,
            lastUpdated: entity.created_at,
            status: entity.status || entity.published,
            description: entity.description || entity.excerpt,
            image: entity.hero_image || entity.thumbnail || entity.avatar_url || entity.logo || entity.images?.[0]
          };
        })
      );

      return entitiesWithGalleries;
    }
  });

  // Fetch available galleries for assignment
  const { data: galleriesForAssignment } = useQuery({
    queryKey: ['available-galleries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_galleries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: showAssignModal
  });

  // Assign/Unassign gallery to entity
  const assignGalleryMutation = useMutation({
    mutationFn: async ({ entityId, galleryId, action }: { entityId: string; galleryId: string; action: 'assign' | 'unassign' }) => {
      if (action === 'assign') {
        const { error } = await supabase
          .from('user_galleries')
          .update({
            owner_type: activeTab.slice(0, -1),
            owner_id: entityId
          })
          .eq('id', galleryId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_galleries')
          .update({
            owner_type: null,
            owner_id: null
          })
          .eq('id', galleryId);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity-galleries'] });
      queryClient.invalidateQueries({ queryKey: ['available-galleries'] });
      setShowAssignModal(false);
    }
  });

  const handleBulkAssign = (entityIds: string[], galleryIds: string[]) => {
    // Implementation for bulk assignment
    console.log('Bulk assign galleries', galleryIds, 'to entities', entityIds);
  };

  const openAssignModal = (entity: EntityWithGalleries) => {
    setSelectedEntity(entity);
    setShowAssignModal(true);
  };

  const EntityIcon = getEntityIcon(activeTab.slice(0, -1));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Entity Gallery Manager
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage gallery assignments across different entity types
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Entity Type Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Groups</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Events</span>
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">Companies</span>
          </TabsTrigger>
          <TabsTrigger value="news" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">News</span>
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Marketplace</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Resources</span>
          </TabsTrigger>
          <TabsTrigger value="pages" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Pages</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Search and Actions */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              {selectedEntities.length > 0 && (
                <Button size="sm">
                  <Link className="h-4 w-4 mr-2" />
                  Bulk Assign ({selectedEntities.length})
                </Button>
              )}
            </div>
          </div>

          {/* Entities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                </div>
              ))
            ) : entitiesData?.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                No {activeTab} found
              </div>
            ) : (
              entitiesData?.map((entity) => (
                <div
                  key={entity.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <Checkbox
                        checked={selectedEntities.includes(entity.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEntities([...selectedEntities, entity.id]);
                          } else {
                            setSelectedEntities(selectedEntities.filter(id => id !== entity.id));
                          }
                        }}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 mr-3 flex-shrink-0">
                          {entity.image ? (
                            <img
                              src={entity.image}
                              alt={entity.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <EntityIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {entity.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {entity.type}
                          </p>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => openAssignModal(entity)}>
                          <Link className="h-4 w-4 mr-2" />
                          Manage Galleries
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Entity
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Unlink className="h-4 w-4 mr-2" />
                          Remove All Galleries
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {entity.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {entity.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <ImageIcon className="h-4 w-4 mr-1" />
                      <span>{entity.assignedGalleries} galleries</span>
                    </div>
                    {entity.status && (
                      <Badge variant={entity.status === 'published' || entity.status === 'active' ? 'default' : 'secondary'}>
                        {entity.status}
                      </Badge>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => openAssignModal(entity)}
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Manage Galleries
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Assignment Modal */}
      {showAssignModal && selectedEntity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <EntityIcon className="h-6 w-6 text-gray-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Manage Galleries for {selectedEntity.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Assign or remove gallery associations
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowAssignModal(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Currently Assigned Galleries */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Assigned Galleries ({selectedEntity.assignedGalleries})
                  </h4>
                  <div className="space-y-3">
                    {selectedEntity.galleries.map((gallery) => (
                      <div
                        key={gallery.id}
                        className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded overflow-hidden bg-gray-200 dark:bg-gray-600 mr-3">
                            {gallery.cover_photo_url ? (
                              <img
                                src={gallery.cover_photo_url}
                                alt={gallery.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <ImageIcon className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {gallery.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {gallery.photo_count} photos
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => assignGalleryMutation.mutate({
                            entityId: selectedEntity.id,
                            galleryId: gallery.id,
                            action: 'unassign'
                          })}
                        >
                          <Unlink className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {selectedEntity.galleries.length === 0 && (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-6">
                        No galleries assigned
                      </p>
                    )}
                  </div>
                </div>

                {/* Available Galleries */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Available Galleries
                  </h4>
                  <div className="space-y-3">
                    {galleriesForAssignment?.filter(g => !selectedEntity.galleries.find(sg => sg.id === g.id)).map((gallery) => (
                      <div
                        key={gallery.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded overflow-hidden bg-gray-200 dark:bg-gray-600 mr-3">
                            {gallery.cover_photo_url ? (
                              <img
                                src={gallery.cover_photo_url}
                                alt={gallery.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <ImageIcon className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {gallery.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {gallery.photo_count} photos • {gallery.privacy_level}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => assignGalleryMutation.mutate({
                            entityId: selectedEntity.id,
                            galleryId: gallery.id,
                            action: 'assign'
                          })}
                        >
                          <Link className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowAssignModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntityGalleryManager;