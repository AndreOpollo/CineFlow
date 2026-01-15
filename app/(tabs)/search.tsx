import EmptyState from "@/components/EmptyState";
import FilterModal from "@/components/FilterModal";
import MovieCard from "@/components/MovieCard";
import { borderRadius, colors, spacing, typography } from "@/constants/theme";
import { TMDBService } from "@/services/tmdb";
import { Grid3x3, List, SearchIcon, SlidersHorizontal, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ViewMode = 'grid' | 'list';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all', // 'all', 'movie', 'tv'
    year: null,
    rating: null,
  });

  // Debounce search
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  async function performSearch() {
    if (query.trim().length < 2) return;

    setLoading(true);
    try {
      const searchResults = await TMDBService.search(query);
      
      // Filter results
      let filtered = searchResults.filter(
        (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
      );

      // Apply type filter
      if (filters.type !== 'all') {
        filtered = filtered.filter(
          (item: any) => item.media_type === filters.type
        );
      }

      // Apply year filter
      if (filters.year) {
        filtered = filtered.filter((item: any) => {
          const date = item.release_date || item.first_air_date;
          if (!date) return false;
          return new Date(date).getFullYear() === filters.year;
        });
      }

      // Apply rating filter
      if (filters.rating) {
        filtered = filtered.filter(
          (item: any) => item.vote_average >= filters.rating!
        );
      }

      setResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function clearSearch() {
    setQuery('');
    setResults([]);
  }

  function applyFilters(newFilters: any) {
    setFilters(newFilters);
    setShowFilters(false);
    if (query.trim().length > 0) {
      performSearch();
    }
  }

  const renderGridItem = ({ item }: any) => (
    <View style={styles.gridItem}>
      <MovieCard
        tmdbId={item.id}
        title={item.title || item.name}
        posterPath={item.poster_path}
        type={item.media_type}
        voteAverage={item.vote_average}
      />
    </View>
  );

  const renderListItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.listItem}
      activeOpacity={0.7}
    >
      <MovieCard
        tmdbId={item.id}
        title={item.title || item.name}
        posterPath={item.poster_path}
        type={item.media_type}
        voteAverage={item.vote_average}
        size="large"
      />
      <View style={styles.listItemInfo}>
        <Text style={styles.listItemTitle} numberOfLines={2}>
          {item.title || item.name}
        </Text>
        {item.overview && (
          <Text style={styles.listItemOverview} numberOfLines={3}>
            {item.overview}
          </Text>
        )}
        <Text style={styles.listItemMeta}>
          {item.media_type === 'movie' ? 'Movie' : 'TV Show'} •{' '}
          {new Date(item.release_date || item.first_air_date).getFullYear()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <SearchIcon size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search movies and TV shows..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} activeOpacity={0.7}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* View Mode & Filter Controls */}
        {results.length > 0 && (
          <View style={styles.controls}>
            <View style={styles.viewToggle}>
              <TouchableOpacity
                style={[
                  styles.viewButton,
                  viewMode === 'grid' && styles.viewButtonActive,
                ]}
                onPress={() => setViewMode('grid')}
                activeOpacity={0.7}
              >
                <Grid3x3
                  size={20} 
                  color={viewMode === 'grid' ? colors.primary : colors.textSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.viewButton,
                  viewMode === 'list' && styles.viewButtonActive,
                ]}
                onPress={() => setViewMode('list')}
                activeOpacity={0.7}
              >
                <List
                  size={20} 
                  color={viewMode === 'list' ? colors.primary : colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilters(true)}
              activeOpacity={0.7}
            >
              <SlidersHorizontal size={20} color={colors.text} />
              <Text style={styles.filterButtonText}>Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : results.length === 0 && query.trim().length > 0 ? (
        <EmptyState
          icon={<SearchIcon size={64} color={colors.textSecondary} />}
          title="No results found"
          message={`No results for "${query}"`}
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon={<SearchIcon size={64} color={colors.textSecondary} />}
          title="Search for content"
          message="Find your favorite movies and TV shows"
        />
      ) : (
        <FlatList
          data={results}
          renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
          keyExtractor={(item: any) => `${item.media_type}-${item.id}`}
          numColumns={viewMode === 'grid' ? 3 : 1}
          key={viewMode} // Force remount on view mode change
          contentContainerStyle={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        filters={filters}
        onClose={() => setShowFilters(false)}
        onApply={applyFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: typography.body.fontSize,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    padding: 2,
  },
  viewButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  viewButtonActive: {
    backgroundColor: colors.surface,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  filterButtonText: {
    color: colors.text,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    padding: spacing.md,
  },
  gridItem: {
    flex: 1,
    maxWidth: '33.33%',
    marginBottom: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  listItemInfo: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: 'center',
  },
  listItemTitle: {
    color: colors.text,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  listItemOverview: {
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    marginBottom: spacing.xs,
  },
  listItemMeta: {
    color: colors.textTertiary,
    fontSize: typography.small.fontSize,
  },
})