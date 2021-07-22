// ==UserScript==
// @name         CheckList B2gether
// @namespace    https://jiracloud.cit.com.br
// @version      0.1
// @description  CheckList B2gether
// @author       allinny (Adapted Leonardo Borges)
// @match        https://jiracloud.cit.com.br/browse*
// @grant        none
// ==/UserScript==

/**
 * projectKey - chave do JIRA do projeto
 * issueType - tipo de task (Sub-Imp, Sub-Test, Sub-Bug, Non Functional Task, Problema)
 * status - status da task (Em Progresso, Em Desenvolvimento, Disponível para Code Review)
 * title - título da caixa que será criada pelo script
 * items - itens do checklist apresentado pelo script
 */

const checkListsRequisitos = [
  {
    projectKey: 'BGET',
    issueType: 'Sub-Imp',
    status: 'Em Progresso',
    title: 'Definition of Done',
    items: [
      'Analisar se a entrega atende as Regras de Negócio',
      'Garantir conformidade ao planejamento de testes',
      'Garantir a execução e passagem de todos os testes (unitários, componentes, mutantes)',
      'Analisar se está sendo seguido a Padronização de nomeclaturas (Arquivos, CSS, Testes e Scripts )',
      'Garantir que a pipeline está passando',
      '[Front] Garantir layout e responsividade em todos os tamanhos de tela homologados (Menor mobile 320 px, Mobile padrão 411px, Tablet 768px, Notebook 1024px, Desktop 1920px)',
      '[Front] Garantir layout e responsividade de acordo com os protótipos',
      '[Front] Garantir layout e responsividade das telas homologadas em todos os navegadores (Google, Mozilla e Safari)',
      '[Front] Analisar e registrar se em outras resoluções o layout quebra',
      '[Front] Garantir que não há erros de usabilidade',
    ],
  },
 {
    projectKey: 'BGET',
    issueType: 'Sub-Bug',
    status: 'Em Progresso',
    title: 'Definition of Done - Correção',
    items: [
      'Preencher corretamente os campos de Bug Type, Root Cause e Root Cause Notes',
      'Garantir a criação e refatoração dos testes (unitário e componente) necessários à correção',
      'Garantir que a correção não impacte o funcionamento da aplicação',
      'Garantir que a pipeline está passando',
    ],
  },
  {
    projectKey: 'BGET',
    issueType: 'Sub-Bug',
    status: 'Em Revisão de Código',
    title: 'Definition of Done - Code Review',
    items: [
      'Revisar se os atributos de Bug Type e Root Cause são coerentes com o Bug'
    ],
  },
    {
    projectKey: 'BGET',
    issueType: 'Non Functional Task',
    status: 'Em Desenvolvimento',
    title: 'Definition of Done',
    items: [
      'Garantir a documentação do que foi feito e informações levantadas na tarefa',
    ],
  },
  {
    projectKey: 'BGET',
    issueType: 'Problema',
    status: 'Em Desenvolvimento',
    title: 'Definition of Done',
    items: [
      'Garantir a execução e passagem de todos os testes (unitários, componentes, mutantes)',
      'Analisar se está sendo seguido a Padronização de nomeclaturas (Arquivos, CSS, Testes e Scripts )',
      'Garantir que a correção não impacte o funcionamento da aplicação',
      'Garantir que a pipeline está passando',
    ],
  },
];

function _byId(id) {
  return document.getElementById(id);
}

function _createElement(tagAndId, content, styles) {
  const ti = tagAndId.split('#');
  const tag = ti[0];
  const elId = typeof ti[1] !== 'undefined' ? ti[1] : `tag-${(Math.random(1000) * 1000).toFixed(0)}`;
  const elStyles = typeof content === 'object' ? content : styles;

  const el = document.createElement(tag);
  el.id = elId;

  if (typeof content === 'string') {
    el.innerHTML = content;
  }

  if (typeof elStyles === 'object') {
    Object.entries(elStyles).forEach(([property, value]) => {
      el.style[property] = value;
    });
  }

  return el;
}

const Keys = {

  getIssue() {
    return document.querySelectorAll('meta[name="ajs-issue-key"]').item(0).content;
  },

  getProject() {
    return this.getIssue().split('-')[0];
  },
};

const StateManager = {

  STORAGE_KEY: 'tm-checklist-state',

  get() {
    const state = localStorage.getItem(this.STORAGE_KEY);

    return state != null
      ? JSON.parse(state)
      : {};
  },

  getIssueState() {
    return this.get()[Keys.getIssue()] || {};
  },

  getItemState(index) {
    return this.getIssueState()[index] || false;
  },

  update(index, value) {
    const issueState = this.getIssueState();

    if (value) {
      issueState[index] = true;
    } else {
      delete issueState[index];
    }

    const currentState = this.get();

    if (Object.keys(issueState).length > 0) {
      currentState[Keys.getIssue()] = issueState;
    } else {
      delete currentState[Keys.getIssue()];
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentState));
  },

};

const CheckListFactory = {

  getIssueType() {
    return _byId('type-val').textContent.trim();
  },

  getIssueStatus() {
    return _byId('status-val').textContent.trim();
  },

  getIssueLabel() {
    return _byId('wrap-labels').textContent.trim();
  },

  getCheckList() {
    return checkListsRequisitos.find(
        element =>
          element.projectKey === Keys.getProject()
          && (element.issueType ? element.issueType === this.getIssueType() : true)
          && (element.status ? element.status === this.getIssueStatus() : true)
          && (element.label ? this.getIssueLabel().includes(element.label) : true)
    );
  },

  create() {
    const checkList = this.getCheckList();

    if (!checkList) {
     alert('Nenhum checklist encontrado para este tipo de tarefa.');
      return;
    }

    //Creating box shape
    const container = _createElement('div#cl-content', {
      border: '#ccc dashed 1px',
      background: '#f4f5f7',
      margin: '0 0 25px',
      padding: '7px',
    });

    const jiraDescriptionModule = _byId('descriptionmodule');
    jiraDescriptionModule.insertBefore(container, jiraDescriptionModule.firstChild);

    const title = _createElement('h4#cl-title', checkList.title);
    title.classList.add('toggle-title');

    container.append(title);

    const list = _createElement('ol#cl-list');
    container.appendChild(list);

    checkList.items.forEach((item, index) => {
      const listItem = _createElement('li');
      list.appendChild(listItem);

      //Create a checklist box
      const checkListBox = _createElement('input');
      checkListBox.type = 'checkBox';
      checkListBox.checked = StateManager.getItemState(index);
      checkListBox.addEventListener('change', event => StateManager.update(index, event.target.checked));
      //Add items to box
      const descItem = _createElement('descItem');
      descItem.htmlFor = checkListBox.id;
      descItem.innerHTML = item;

      listItem.appendChild(checkListBox);
      listItem.appendChild(descItem);
    });
  },

};

CheckListFactory.create();