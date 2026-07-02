vim.lsp.config.tsserver = {
	capabilities = {
		documentFormattingProvider = false,
		documentRangeFormattingProvider = false,
	},
}
vim.lsp.enable("tsserver")

vim.lsp.config.biome = {}
vim.lsp.enable("biome")

vim.lsp.config.tailwindcss = {
	settings = {
		tailwindCSS = {
			experimental = {
				classRegex = { [[class:="([^"]*)"]] },
			},
		},
	},
}
vim.lsp.enable("tailwindcss")
