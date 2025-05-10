.PHONY: md-padding list-md

# Find all Markdown files, excluding the node_modules directory
MD_FILES := $(shell find . -name "*.md" -not -path "./node_modules/*")

# 主命令：格式化所有 Markdown 文件
md-padding:
	@echo "正在处理 $(words $(MD_FILES)) 个 Markdown 文件..."
	@for file in $(MD_FILES); do \
		echo "处理: $$file"; \
		npx md-padding -i "$$file" || echo "警告: $$file 处理失败"; \
	done
	@echo "✅ 全部处理完成!"

# 显示将被处理的文件列表
list-md:
	@echo "将处理以下 Markdown 文件:"
	@for file in $(MD_FILES); do \
		echo " - $$file"; \
	done
	@echo "总计: $(words $(MD_FILES)) 个文件"