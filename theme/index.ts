import { extendTheme } from '@chakra-ui/react';
import { layerStyles } from './layerStyles';
import { semanticTokens } from './semanticTokens';

export const theme = extendTheme({
    semanticTokens,
    layerStyles,
});
