export const colors = {
  primary:'#E50914',
  primaryDark:'#B20710',

  background:'#141414',
  surface:'#1F1F1F',
  surfaceLight:'#2A2A2A',

  text:'#FFFFFF',
  textSecondary:'#B3B3B3',
  textTertiary:'#808080',

  accent:'#FFD700',
  success:'#46D369',
  warning:'#FFA500',
  error:'#DC3545',

  overlay: 'rgba(0,0,0,0.7)',
  overlayLight:'rgba(0,0,0,0.4)'
}

export const spacing = {
  xs: 4,
  sm:8,
  md:16,
  lg:24,
  xl:32,
  xxl:48
}

export const typography = {
  hero: {
    fontSize: 32,
    fontWeight:'700' as const,
    lineHeight:40
  },
  h1: {
    fontSize:28,
    fontWeight:'700' as const,
    lineHeight: 36
  },
  h2: {
    fontSize: 24,
    fontWeight:'600' as const,
    lineHeight: 32
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28
  },
  body:{
    fontSize:16,
    fontWeight:'400' as const,
    lineHeight:24
  },
  caption:{
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20
  },
  small:{
    fontSize:12,
    fontWeight:'400' as const,
    lineHeight: 16
  }
}

export const borderRadius = {
  sm:4,
  md:8,
  lg:12,
  xl:16,
  full:9999
}

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 8,
  },
}

export const cardSizes = {
  poster: {
    width: 110,
    height: 165,
  },
  posterLarge: {
    width: 140,
    height: 210,
  },
  hero: {
    height: 400,
  },
  cast: {
    width: 80,
    height: 80,
  },
}