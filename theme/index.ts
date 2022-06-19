import { extendTheme } from '@chakra-ui/react';
import { layerStyles } from './layerStyles';
import { semanticTokens } from './semanticTokens';
import { components } from './components';

export const theme = extendTheme({
    semanticTokens,
    layerStyles,
    components,
});
