import { colors, spacing, typography } from "@/constants/theme"
import { Film } from "lucide-react-native"
import { StyleSheet, Text, View } from "react-native"


interface EmptyStateProps{
    icon?: React.ReactNode,
    title:string,
    message:string
}

export default function EmptyState({
    icon = <Film size={64} color={colors.textSecondary}/>,
    title,
    message
}:EmptyStateProps){
  return (
    <View style={styles.container}>
        {icon}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  )

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  title: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    textAlign: 'center',
  },
  message: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    lineHeight: typography.body.lineHeight,
  },
})