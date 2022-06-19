export const Button = {
    variants: {
        primary: () => ({
            bg: 'secondary',
            textColor: 'textYellow',
            borderColor: 'textYellow',
            borderWidth: '1px',
            _hover: {
                bg: 'tertiary',
            },
            _active: {
                boxShadow: 'none',
            },
            _focus: {
                boxShadow: 'none',
            },
        }),
        secondary: () => ({
            bg: 'secondary',
            textColor: 'textPrimary',
            borderColor: 'secondary',
            borderWidth: '1px',
            _hover: {
                bg: 'tertiary',
            },
            _active: {
                boxShadow: 'none',
            },
            _focus: {
                boxShadow: 'none',
            },
        }),
    },
};
