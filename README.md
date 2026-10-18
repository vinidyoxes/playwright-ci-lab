# Playwright CI Lab

Laboratório de integração com Playwright + TypeScript e GitHub Actions. A aplicação Node.js roda apenas em `127.0.0.1:4173`, na sua máquina ou no runner. Não precisa de AEM, credenciais ou um site externo. Este workflow valida testes (CI); não realiza deploy (CD).

## 1. Rodar localmente

Pré-requisitos: Node.js 24 LTS, npm e Git. Abra esta pasta no VS Code e use o terminal:

```sh
node --version
npm ci
npx playwright install chromium
npm test
```

Em Linux, se faltarem bibliotecas do navegador: `npx playwright install --with-deps chromium` (pode precisar de privilégios de instalação de pacotes do sistema). A porta 4173 deve estar livre.

O Playwright inicia e encerra a aplicação automaticamente. Esperado: **4 passed, 1 skipped**. O teste ignorado só roda quando você habilita a falha intencional.

```sh
npm run test:headed
npm run test:ui
npm run test:report
```

`npm ci` usa o package-lock.json incluído para instalar as mesmas versões do laboratório. Não precisa executar `npm start` separadamente.

## 2. O que está sendo validado

| Teste | Verificação |
| --- | --- |
| UI | Título e heading da página |
| API | HTTP 200, Content-Type e conteúdo JSON |
| E2E | Clique na interface chama a API real e exibe o resultado |
| Redirect | HTTP 302 e Location iniciais; URL, HTTP 200 e conteúdo finais |
| Falha intencional | Expectativa incorreta, habilitada apenas para exercício |

`playwright.config.ts` contém configuração do navegador, servidor, relatórios e evidências. `tests/smoke.spec.ts` contém os testes. `demo/server.mjs` é a aplicação testada. `.github/workflows/playwright.yml` é a pipeline.

## 3. Subir para um repositório de laboratório

Crie um repositório vazio de teste na organização apropriada e copie sua URL de clone. Execute na pasta extraída, substituindo URL_DO_REPOSITORIO pela URL real:

```sh
git init
git branch -M main
git add .
git commit -m "Add Playwright CI integration lab"
git remote add origin URL_DO_REPOSITORIO
git push -u origin main
```

O commit inclui o package-lock.json e a pasta .github. Não inclui node_modules nem os relatórios. Se usar um repositório existente, trabalhe em uma branch de teste e adapte paths/working-directory caso o laboratório fique em uma subpasta; o workflow incluído pressupõe que este projeto esteja na raiz do repositório.

## 4. Verificar no GitHub

Abra **Actions > Playwright CI Lab**. O workflow roda em push para main/master, em pull requests e manualmente. O job prepara Node.js, instala dependências e Chromium, roda os testes e publica o relatório como artifact `playwright-results`.

Para exercitar uma falha: na branch padrão, abra **Run workflow**, marque `demo_fail` e execute. O teste intencional deve falhar, o job deve ficar vermelho e o artifact deve conter evidências. Execute novamente com a opção desmarcada para voltar ao resultado verde. O exercício não altera o código.

Para testar o evento de PR: crie `git checkout -b test/ci-trigger`, faça uma alteração simples neste README, commit e push da branch, e abra um PR para main. Confirme que o job apareceu no PR.

Uma pipeline vermelha só impede merge quando o repositório tem uma regra de proteção/ruleset exigindo o check correspondente. Isso não é configurado por este projeto.

## 5. GitHub da empresa

- Confirme que o repositório tem GitHub Actions habilitado e um runner disponível. GitHub Enterprise pode usar outra ferramenta de CI; não presuma que Actions esteja habilitado.
- O padrão `runs-on: ubuntu-latest` atende runners hospedados do GitHub quando disponíveis. Para runner corporativo Linux, substitua pela lista real de labels autorizadas, por exemplo `[self-hosted, linux, x64]`, apenas se essas labels existirem. O runner precisa ser compatível com as versões das actions.
- O workflow usa versões diferentes de upload de artifacts para github.com e GitHub Enterprise Server, conforme a documentação do projeto actions/upload-artifact. A disponibilidade exata e as versões permitidas dependem da instalação corporativa.
- Checkout, setup-node e upload-artifact precisam estar disponíveis/liberados pela organização. A empresa pode exigir referências por SHA ou espelhos internos das actions.
- Instalação de npm e download de Chromium precisam de acesso à rede, proxy ou espelhos aprovados. Em runners sem permissão de instalar pacotes do sistema, use um runner já preparado ou uma imagem Playwright aprovada pelo time responsável.
- Este laboratório não exige secrets nem acessa serviços internos. Não faz publicação de aplicação.

## 6. Próximo exercício: pipeline de deploy

Para testes após deploy em STAGE, a suíte deve depender do job que realizou o deploy e aguardar a aplicação ficar pronta. Nesse cenário, substitua a aplicação de laboratório pelo alvo real, configure baseURL e autenticação de teste, e remova/adapte webServer. Rodar este workflow sozinho não estabelece uma dependência com o pipeline de release do AEM.

## Referências

- https://playwright.dev/docs/ci-intro
- https://playwright.dev/docs/ci
- https://github.com/actions/upload-artifact#ghes-support
