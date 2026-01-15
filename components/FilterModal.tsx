import { borderRadius, colors, spacing, typography } from "@/constants/theme"
import { X } from "lucide-react-native"
import { useState } from "react"
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"


interface FilterModalProps{
    visible:boolean,
    filters:{
        type:string,
        year: number | null,
        rating: number | null
    },
    onClose: ()=>void,
    onApply:(fliters:any)=>void
}

export default function FilterModal({
    visible,
    filters,
    onClose,
    onApply
}:FilterModalProps){
    const[localFilters,setLocalFilters] = useState(filters)

    const currentYear = new Date().getFullYear()
    const years = Array.from({length:30},(_,i)=>currentYear-i)
    const ratings = [7.0,8.0,9.0]

    function handleApply(){
        onApply(localFilters)
    }

    function handleReset(){
        const resetFilters = {type:'all',year:null,rating:null}
        setLocalFilters(resetFilters)
        onApply(resetFilters)
    }

    return(
        <Modal 
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={onClose}>
            <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Type Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Content Type</Text>
              <View style={styles.options}>
                {['all', 'movie', 'tv'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.option,
                      localFilters.type === type && styles.optionActive,
                    ]}
                    onPress={() =>
                      setLocalFilters({ ...localFilters, type })
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        localFilters.type === type && styles.optionTextActive,
                      ]}
                    >
                      {type === 'all' ? 'All' : type === 'movie' ? 'Movies' : 'TV Shows'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Year Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Release Year</Text>
              <View style={styles.options}>
                <TouchableOpacity
                  style={[
                    styles.option,
                    !localFilters.year && styles.optionActive,
                  ]}
                  onPress={() =>
                    setLocalFilters({ ...localFilters, year: null })
                  }
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      !localFilters.year && styles.optionTextActive,
                    ]}
                  >
                    Any
                  </Text>
                </TouchableOpacity>
                {years.slice(0, 10).map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.option,
                      localFilters.year === year && styles.optionActive,
                    ]}
                    onPress={() =>
                      setLocalFilters({ ...localFilters, year })
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        localFilters.year === year && styles.optionTextActive,
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Rating Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Minimum Rating</Text>
              <View style={styles.options}>
                <TouchableOpacity
                  style={[
                    styles.option,
                    !localFilters.rating && styles.optionActive,
                  ]}
                  onPress={() =>
                    setLocalFilters({ ...localFilters, rating: null })
                  }
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      !localFilters.rating && styles.optionTextActive,
                    ]}
                  >
                    Any
                  </Text>
                </TouchableOpacity>
                {ratings.map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.option,
                      localFilters.rating === rating && styles.optionActive,
                    ]}
                    onPress={() =>
                      setLocalFilters({ ...localFilters, rating })
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        localFilters.rating === rating &&
                          styles.optionTextActive,
                      ]}
                    >
                      {rating}+
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.7}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>


        </Modal>
    )



}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  title: {
    color: colors.text,
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
  },
  content: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  option: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  optionActive: {
    backgroundColor: colors.primary,
  },
  optionText: {
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  optionTextActive: {
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
  },
  resetButton: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  resetButtonText: {
    color: colors.text,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  applyButtonText: {
    color: colors.text,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
})