import type { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#2563eb', colorText: '#172235', colorTextSecondary: '#63728a',
    colorBorder: '#dbe4ef', colorBgLayout: '#f8fafd', colorBgContainer: '#fff',
    fontFamily: 'var(--font-ui)', fontFamilyCode: 'var(--font-code)', fontSize: 14, borderRadius: 6,
    controlHeight: 32, lineHeight: 1.5714286, motion: true
  },
  components: {
    Button: { primaryShadow: '0 2px 4px #1d5ddd1a', defaultShadow: 'none', fontWeight: 500 },
    Tree: { titleHeight: 36, indentSize: 18, nodeHoverBg: '#f5f8fd', nodeSelectedBg: '#fff4f7', nodeSelectedColor: '#263144' },
    Segmented: { itemSelectedBg: '#edf4ff', itemSelectedColor: '#1655e6', trackBg: '#fff' },
    Tabs: { itemColor: '#63728a', itemSelectedColor: '#2563eb', horizontalItemGutter: 20, titleFontSize: 14 },
    Table: { headerBg: '#f5f7fa', headerColor: '#354962', cellPaddingBlockSM: 10, cellPaddingInlineSM: 11, borderColor: '#dbe4ef' },
    Tag: { defaultBg: '#fff', defaultColor: '#476078' },
    Modal: { titleFontSize: 20 }, Drawer: { footerPaddingBlock: 16, footerPaddingInline: 20 }
  }
};
