import { extendTheme } from '@chakra-ui/react'

// 2. Define the new text styles
const theme = extendTheme({
  textStyles: {
    h1: {
      // you can also use responsive styles
      fontSize: ['48px', '72px'],
      fontWeight: 'bold',
      lineHeight: '110%',
      letterSpacing: '-2%',
      textTransform: 'uppercase',
    },
    h2: {
      fontSize: ['22px', '24px'],
      fontWeight: 'semibold',
      lineHeight: '110%',
      letterSpacing: '-1%',
      textTransform: 'uppercase',
    },
    h3: {
      fontSize: ['18px', '20px'],
      fontWeight: 'semibold',
      lineHeight: '110%',
      letterSpacing: '-1%',
      textTransform: 'uppercase',
    },
  },
});

export default theme;