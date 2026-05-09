// src/screens/instrutor/InstrutorScreens.tsx
// ─────────────────────────────────────────
// Camis FIT — Todas as telas do Instrutor
// ─────────────────────────────────────────
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Alert, TextInput, StyleSheet, Share,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { NeonButton, Card, StatCard, SectionTitle, Input, StatusBadge, Tag, ProgressBar, Divider, Avatar, AppHeader } from '../../components';
import { useStore } from '../../services/store';

const pad = { paddingHorizontal: Spacing.lg };

// ── Dashboard Instrutor ────────────────
export const InstrutorHomeScreen = ({ navigation }: any) => {
  const { user, alunos, faturas } = useStore();
  const totalRecebido = faturas.filter(f => f.status === 'pago').reduce((s, f) => s + f.valor, 0);
  const totalPendente = faturas.filter(f => f.status !== 'pago').reduce((s, f) => s + f.valor, 0);
  const alunosAtivos = alunos.filter(a => a.ativo).length;
  const meta = 5000;

  const compartilharCodigo = () => {
    Share.share({ message: `Entre no Camis FIT com meu código: ${user?.codigoConvite}\nBaixe o app: https://camisfit.com.br` });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} showsVerticalScrollIndicator={false}>
      <AppHeader
        greeting="Olá,"
        title={user?.nome || ''}
        rightContent={
          <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.purpleDim, borderWidth: 1.5, borderColor: Colors.purple + '70', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: Typography.weights.black, color: '#cc88ff' }}>{user?.avatarInitials}</Text>
          </View>
        }
      />

      <View style={{ padding: Spacing.lg }}>
        {/* Financial card */}
        <Card neon style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 10, color: Colors.textSub, textTransform: 'uppercase', letterSpacing: 1, fontWeight: Typography.weights.bold, marginBottom: 10 }}>Painel financeiro</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
            <View style={{ flex: 1, backgroundColor: Colors.card2, borderRadius: Radius.lg, padding: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: Typography.weights.black, color: Colors.neon }}>R${totalRecebido.toLocaleString('pt-BR')}</Text>
              <Text style={{ fontSize: 9, color: Colors.textSub, marginTop: 2, textTransform: 'uppercase' }}>Recebido</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: Colors.card2, borderRadius: Radius.lg, padding: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: Typography.weights.black, color: Colors.amber }}>R${totalPendente.toLocaleString('pt-BR')}</Text>
              <Text style={{ fontSize: 9, color: Colors.textSub, marginTop: 2, textTransform: 'uppercase' }}>Pendente</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: Colors.card2, borderRadius: Radius.lg, padding: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: Typography.weights.black, color: '#cc88ff' }}>{alunosAtivos}</Text>
              <Text style={{ fontSize: 9, color: Colors.textSub, marginTop: 2, textTransform: 'uppercase' }}>Alunos</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 10, color: Colors.textSub }}>Meta mensal</Text>
            <Text style={{ fontSize: 10, color: Colors.neon, fontWeight: Typography.weights.bold }}>R${(totalRecebido + totalPendente).toLocaleString('pt-BR')} / R${meta.toLocaleString('pt-BR')}</Text>
          </View>
          <ProgressBar progress={(totalRecebido + totalPendente) / meta} />
        </Card>

        {/* Alunos */}
        <SectionTitle title="Seus alunos" />
        {alunos.slice(0, 3).map(aluno => (
          <TouchableOpacity key={aluno.id} onPress={() => navigation.navigate('DetalheAluno', { aluno })} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, backgroundColor: Colors.card2, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: 7 }}>
            <Avatar initials={aluno.nome.slice(0, 2).toUpperCase()} color={aluno.statusPagamento === 'pago' ? Colors.neon : aluno.statusPagamento === 'pendente' ? Colors.blue : Colors.pink} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: Typography.weights.bold }}>{aluno.nome}</Text>
              <Text style={{ fontSize: 11, color: Colors.textSub }}>{aluno.objetivo} · {aluno.nivel}</Text>
            </View>
            <StatusBadge status={aluno.statusPagamento} />
          </TouchableOpacity>
        ))}
        <NeonButton label="Ver todos os alunos" variant="ghost" onPress={() => {}} style={{ marginBottom: 12 }} small />

        {/* Código de convite */}
        <SectionTitle title="Código de convite" />
        <View style={{ backgroundColor: Colors.card2, borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.neonBorder, borderRadius: Radius.lg, padding: 16, alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 10, color: Colors.textSub, fontWeight: Typography.weights.bold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Seu código único</Text>
          <Text style={{ fontSize: 30, fontWeight: Typography.weights.black, letterSpacing: 6, color: Colors.neon, ...Shadows.neon }}>{user?.codigoConvite}</Text>
          <Text style={{ fontSize: 11, color: Colors.textSub, marginTop: 6 }}>Compartilhe com seus alunos</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: Spacing.xxl }}>
          <NeonButton label="Copiar código" variant="ghost" onPress={() => {}} style={{ flex: 1 }} small />
          <NeonButton label="Compartilhar" variant="ghost" onPress={compartilharCodigo} style={{ flex: 1 }} small />
        </View>
      </View>
    </ScrollView>
  );
};

// ── Alunos Instrutor ───────────────────
export const AlunosScreen = ({ navigation }: any) => {
  const { alunos, updateAluno, bloquearAluno } = useStore();
  const [emailNovo, setEmailNovo] = useState('');
  const [novoNome, setNovoNome] = useState('');
  const [novoEx, setNovoEx] = useState({ nome: '', series: '', reps: '', descanso: '', obs: '' });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} showsVerticalScrollIndicator={false}>
      <AppHeader title={`Meus Alunos (${alunos.length})`} />

      <View style={{ padding: Spacing.lg }}>
        {alunos.map(aluno => (
          <Card key={aluno.id} neon={aluno.ativo} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Avatar initials={aluno.nome.slice(0, 2).toUpperCase()} size={44} color={aluno.statusPagamento === 'pago' ? Colors.neon : aluno.statusPagamento === 'pendente' ? Colors.blue : Colors.pink} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: Typography.weights.bold }}>{aluno.nome}</Text>
                <Text style={{ fontSize: 11, color: Colors.textSub }}>{aluno.objetivo} · {aluno.nivel}</Text>
              </View>
              <StatusBadge status={aluno.statusPagamento} />
            </View>

            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
              <View style={{ flex: 1, backgroundColor: Colors.card2, borderRadius: Radius.md, padding: 8, alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: Typography.weights.black, color: Colors.neon }}>{aluno.treinos}</Text>
                <Text style={{ fontSize: 9, color: Colors.textSub, textTransform: 'uppercase' }}>Treinos</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: Colors.card2, borderRadius: Radius.md, padding: 8, alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: Typography.weights.black }}>{aluno.peso}kg</Text>
                <Text style={{ fontSize: 9, color: Colors.textSub, textTransform: 'uppercase' }}>Peso</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: Colors.card2, borderRadius: Radius.md, padding: 8, alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: Typography.weights.black, color: aluno.peso < aluno.pesoInicial ? Colors.neon : Colors.red }}>
                  {(aluno.peso - aluno.pesoInicial) > 0 ? '+' : ''}{(aluno.peso - aluno.pesoInicial).toFixed(1)}kg
                </Text>
                <Text style={{ fontSize: 9, color: Colors.textSub, textTransform: 'uppercase' }}>Evolução</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <NeonButton label="Enviar treino" onPress={() => Alert.alert('Treino enviado!', `Ficha enviada para ${aluno.nome}`)} style={{ flex: 1 }} small />
              <NeonButton label="Fatura" variant="ghost" onPress={() => {}} style={{ flex: 1 }} small />
              {!aluno.ativo && (
                <NeonButton label="Desbloquear" variant="purple" onPress={() => updateAluno(aluno.id, { ativo: true })} style={{ flex: 1 }} small />
              )}
              {aluno.ativo && aluno.statusPagamento === 'vencido' && (
                <NeonButton label="Bloquear" variant="danger" onPress={() => bloquearAluno(aluno.id)} style={{ flex: 1 }} small />
              )}
            </View>
          </Card>
        ))}

        {/* Liberar novo aluno */}
        <SectionTitle title="Liberar novo aluno" />
        <Card>
          <Input label="E-mail do aluno" value={emailNovo} onChangeText={setEmailNovo} placeholder="aluno@email.com" keyboardType="email-address" autoCapitalize="none" />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <NeonButton label="Liberar acesso" onPress={() => { Alert.alert('Convite enviado!', `Acesso liberado para ${emailNovo}`); setEmailNovo(''); }} style={{ flex: 1 }} small />
            <NeonButton label="Via QR Code" variant="ghost" onPress={() => Alert.alert('QR Code', 'Mostrar QR Code com o código de convite')} style={{ flex: 1 }} small />
          </View>
        </Card>

        {/* Cadastrar exercício */}
        <SectionTitle title="Cadastrar exercício" />
        <Card>
          <Input label="Nome do exercício" value={novoEx.nome} onChangeText={v => setNovoEx(p => ({ ...p, nome: v }))} placeholder="Ex: Supino reto com barra" />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}><Input label="Séries" value={novoEx.series} onChangeText={v => setNovoEx(p => ({ ...p, series: v }))} placeholder="4" keyboardType="numeric" /></View>
            <View style={{ flex: 1 }}><Input label="Repetições" value={novoEx.reps} onChangeText={v => setNovoEx(p => ({ ...p, reps: v }))} placeholder="10-12" /></View>
            <View style={{ flex: 1 }}><Input label="Descanso" value={novoEx.descanso} onChangeText={v => setNovoEx(p => ({ ...p, descanso: v }))} placeholder="90s" /></View>
          </View>
          <Input label="Observação para o aluno" value={novoEx.obs} onChangeText={v => setNovoEx(p => ({ ...p, obs: v }))} placeholder="Dica de execução..." />
          <NeonButton label="Adicionar exercício" onPress={() => { Alert.alert('Exercício adicionado!'); setNovoEx({ nome: '', series: '', reps: '', descanso: '', obs: '' }); }} small />
        </Card>
        <View style={{ height: 30 }} />
      </View>
    </ScrollView>
  );
};

// ── Fichas de Treino Instrutor ─────────
export const TreinosInstrutorScreen = ({ navigation }: any) => {
  const { fichasTreino, alunos, addFicha, user } = useStore();
  const [editando, setEditando] = useState<null | string>(null);
  const [criando, setCriando] = useState(false);
  const [novaFicha, setNovaFicha] = useState({ titulo: '', nivel: 'Intermediário', duracao: '60', descricao: '' });

  const criarFicha = () => {
    if (!novaFicha.titulo.trim()) { Alert.alert('Informe o título da ficha'); return; }
    addFicha({
      id: 'f-' + Date.now(),
      titulo: novaFicha.titulo.trim(),
      descricao: novaFicha.descricao,
      nivel: novaFicha.nivel,
      exercicios: [],
      duracao: parseInt(novaFicha.duracao) || 60,
      instrutorId: user?.id || 'i1',
      alunosVinculados: [],
      criadoEm: new Date().toISOString().split('T')[0],
    });
    Alert.alert('Ficha criada!', 'Use "Editar" para adicionar exercícios.');
    setCriando(false);
    setNovaFicha({ titulo: '', nivel: 'Intermediário', duracao: '60', descricao: '' });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} showsVerticalScrollIndicator={false}>
      <AppHeader title="Fichas de Treino" />

      <View style={{ padding: Spacing.lg }}>
        <NeonButton label={criando ? '✕ Cancelar' : '+ Nova ficha de treino'} variant={criando ? 'ghost' : undefined} onPress={() => setCriando(v => !v)} style={{ marginBottom: 12 }} />

        {criando && (
          <Card style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 13, fontWeight: Typography.weights.bold, marginBottom: 12, color: Colors.neon }}>Nova ficha de treino</Text>
            <Input label="Título *" value={novaFicha.titulo} onChangeText={v => setNovaFicha(p => ({ ...p, titulo: v }))} placeholder="Ex: Treino A – Peito e Tríceps" />
            <Text style={{ fontSize: 10, fontWeight: Typography.weights.bold, color: Colors.textMid, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Nível</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
              {['Iniciante', 'Intermediário', 'Avançado'].map(n => (
                <TouchableOpacity key={n} onPress={() => setNovaFicha(p => ({ ...p, nivel: n }))} style={{ flex: 1, paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1.5, borderColor: novaFicha.nivel === n ? Colors.neonBorder : Colors.border, backgroundColor: novaFicha.nivel === n ? Colors.neonDim : Colors.card2, alignItems: 'center' }}>
                  <Text style={{ fontSize: 11, fontWeight: Typography.weights.bold, color: novaFicha.nivel === n ? Colors.neon : Colors.textSub }}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Input label="Duração (min)" value={novaFicha.duracao} onChangeText={v => setNovaFicha(p => ({ ...p, duracao: v }))} placeholder="60" keyboardType="numeric" />
            <Input label="Descrição (opcional)" value={novaFicha.descricao} onChangeText={v => setNovaFicha(p => ({ ...p, descricao: v }))} placeholder="Detalhes da ficha..." />
            <NeonButton label="Criar ficha" onPress={criarFicha} small />
          </Card>
        )}

        {fichasTreino.map(ficha => (
          <Card key={ficha.id} neon style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: Typography.weights.bold, marginBottom: 2 }}>{ficha.titulo}</Text>
                <Text style={{ fontSize: 11, color: Colors.textSub }}>{ficha.exercicios.length} exercícios · {ficha.duracao} min</Text>
              </View>
              <Tag label={ficha.nivel} color={ficha.nivel === 'Iniciante' ? 'purple' : ficha.nivel === 'Avançado' ? 'red' : 'blue'} />
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
              {ficha.alunosVinculados.map(id => {
                const a = alunos.find(al => al.id === id);
                return a ? <Tag key={id} label={a.nome.split(' ')[0]} color="green" /> : null;
              })}
            </View>

            <Divider style={{ marginVertical: 8 }} />

            {/* Exercícios preview */}
            {ficha.exercicios.slice(0, 3).map(ex => (
              <View key={ex.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                <Text style={{ fontSize: 12, color: Colors.text }}>{ex.nome}</Text>
                <Text style={{ fontSize: 11, color: Colors.textSub }}>{ex.series}x{ex.repeticoes} · {ex.descanso}</Text>
              </View>
            ))}
            {ficha.exercicios.length > 3 && (
              <Text style={{ fontSize: 11, color: Colors.textSub, marginTop: 2 }}>+{ficha.exercicios.length - 3} exercícios...</Text>
            )}

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <NeonButton label="Editar" variant="ghost" onPress={() => Alert.alert('Editor', 'Editar ficha: ' + ficha.titulo)} style={{ flex: 1 }} small />
              <NeonButton label="Enviar para aluno" onPress={() => Alert.alert('Enviar treino', 'Para qual aluno deseja enviar?')} style={{ flex: 1 }} small />
            </View>
          </Card>
        ))}
        <View style={{ height: 30 }} />
      </View>
    </ScrollView>
  );
};

// ── Faturas Instrutor ──────────────────
export const FaturasInstrutorScreen = () => {
  const { faturas, alunos, addFatura, marcarPago } = useStore();
  const [novaFat, setNovaFat] = useState({ alunoId: 'a1', tipo: 'mensalidade', descricao: '', valor: '' });

  const totalRecebido = faturas.filter(f => f.status === 'pago').reduce((s, f) => s + f.valor, 0);
  const totalPendente = faturas.filter(f => f.status !== 'pago').reduce((s, f) => s + f.valor, 0);

  const tipoLabel: Record<string, string> = {
    mensalidade: 'Mensalidade',
    alteracao_treino: 'Alteração de Treino',
    atualizacao_dieta: 'Atualização de Dieta',
    personalizado: 'Personalizado',
  };

  const gerarFatura = () => {
    if (!novaFat.valor) { Alert.alert('Informe o valor'); return; }
    const aluno = alunos.find(a => a.id === novaFat.alunoId);
    addFatura({
      id: 'fat-' + Date.now(),
      alunoId: novaFat.alunoId,
      alunoNome: aluno?.nome || '',
      instrutorId: 'i1',
      tipo: novaFat.tipo as any,
      descricao: novaFat.descricao || tipoLabel[novaFat.tipo],
      valor: parseFloat(novaFat.valor.replace(',', '.')),
      status: 'pendente',
      vencimento: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      criadoEm: new Date().toISOString().split('T')[0],
    });
    Alert.alert('Fatura gerada!', 'O aluno será notificado.');
    setNovaFat({ alunoId: 'a1', tipo: 'mensalidade', descricao: '', valor: '' });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} showsVerticalScrollIndicator={false}>
      <AppHeader title="Faturas" />

      <View style={{ padding: Spacing.lg }}>
        <Card neon style={{ marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1, backgroundColor: Colors.card2, borderRadius: Radius.md, padding: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: Typography.weights.black, color: Colors.neon }}>R${totalRecebido.toLocaleString('pt-BR')}</Text>
              <Text style={{ fontSize: 9, color: Colors.textSub, textTransform: 'uppercase', marginTop: 2 }}>Recebido</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: Colors.card2, borderRadius: Radius.md, padding: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: Typography.weights.black, color: Colors.amber }}>R${totalPendente.toLocaleString('pt-BR')}</Text>
              <Text style={{ fontSize: 9, color: Colors.textSub, textTransform: 'uppercase', marginTop: 2 }}>Pendente</Text>
            </View>
          </View>
        </Card>

        <SectionTitle title="Cobranças recentes" />
        {faturas.map(fat => (
          <View key={fat.id} style={{ backgroundColor: Colors.card2, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 12, marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 13, fontWeight: Typography.weights.bold }}>{fat.alunoNome}</Text>
              <Text style={{ fontSize: 15, fontWeight: Typography.weights.black, color: Colors.neon }}>R${fat.valor.toFixed(2).replace('.', ',')}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: fat.status !== 'pago' ? 8 : 0 }}>
              <Text style={{ fontSize: 11, color: Colors.textSub }}>{fat.descricao}</Text>
              <StatusBadge status={fat.status} />
            </View>
            {fat.status === 'pendente' && (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <NeonButton label="Marcar pago" onPress={() => { marcarPago(fat.id); Alert.alert('Marcado como pago!'); }} style={{ flex: 1 }} small />
                <NeonButton label="Notificar" variant="ghost" onPress={() => Alert.alert('Notificação enviada!')} style={{ flex: 1 }} small />
              </View>
            )}
            {fat.status === 'vencido' && (
              <NeonButton label="Bloquear acesso do aluno" variant="danger" onPress={() => Alert.alert('Confirmar?', 'Bloquear acesso de ' + fat.alunoNome + '?', [{ text: 'Cancelar' }, { text: 'Bloquear', style: 'destructive', onPress: () => Alert.alert('Acesso bloqueado') }])} small />
            )}
          </View>
        ))}

        {/* Nova cobrança */}
        <SectionTitle title="Nova cobrança" />
        <Card>
          <Text style={{ fontSize: 10, color: Colors.textMid, textTransform: 'uppercase', fontWeight: Typography.weights.bold, letterSpacing: 0.5, marginBottom: 4 }}>Aluno</Text>
          {alunos.map(a => (
            <TouchableOpacity key={a.id} onPress={() => setNovaFat(p => ({ ...p, alunoId: a.id }))} style={{ flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: Radius.md, borderWidth: 1, borderColor: novaFat.alunoId === a.id ? Colors.neonBorder : Colors.border, backgroundColor: novaFat.alunoId === a.id ? Colors.neonDim : Colors.card2, marginBottom: 5 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: novaFat.alunoId === a.id ? Colors.neon : Colors.textSub, backgroundColor: novaFat.alunoId === a.id ? Colors.neon : 'transparent', marginRight: 8 }} />
              <Text style={{ fontSize: 13, color: novaFat.alunoId === a.id ? Colors.neon : Colors.text }}>{a.nome}</Text>
            </TouchableOpacity>
          ))}

          <Text style={{ fontSize: 10, color: Colors.textMid, textTransform: 'uppercase', fontWeight: Typography.weights.bold, letterSpacing: 0.5, marginTop: 8, marginBottom: 4 }}>Tipo de cobrança</Text>
          {Object.entries(tipoLabel).map(([k, v]) => (
            <TouchableOpacity key={k} onPress={() => setNovaFat(p => ({ ...p, tipo: k }))} style={{ flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: Radius.md, borderWidth: 1, borderColor: novaFat.tipo === k ? Colors.neonBorder : Colors.border, backgroundColor: novaFat.tipo === k ? Colors.neonDim : Colors.card2, marginBottom: 5 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: novaFat.tipo === k ? Colors.neon : Colors.textSub, backgroundColor: novaFat.tipo === k ? Colors.neon : 'transparent', marginRight: 8 }} />
              <Text style={{ fontSize: 12, color: novaFat.tipo === k ? Colors.neon : Colors.text }}>{v}</Text>
            </TouchableOpacity>
          ))}

          <Input label="Valor (R$)" value={novaFat.valor} onChangeText={v => setNovaFat(p => ({ ...p, valor: v }))} placeholder="180,00" keyboardType="numeric" style={{ marginTop: 8 }} />
          <Input label="Descrição (opcional)" value={novaFat.descricao} onChangeText={v => setNovaFat(p => ({ ...p, descricao: v }))} placeholder="Detalhes da cobrança..." />
          <NeonButton label="Gerar fatura" onPress={gerarFatura} small />
        </Card>
        <View style={{ height: 30 }} />
      </View>
    </ScrollView>
  );
};

// ── Perfil Instrutor ───────────────────
export const PerfilInstrutorScreen = () => {
  const { user, logout } = useStore();
  const [nome, setNome] = useState(user?.nome || '');
  const [cref, setCref] = useState(user?.cref || '');
  const [pix, setPix] = useState('');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} showsVerticalScrollIndicator={false}>
      <AppHeader
        greeting="Perfil"
        title={user?.nome || ''}
        rightContent={
          <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.purpleDim, borderWidth: 1.5, borderColor: Colors.purple + '70', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: Typography.weights.black, color: '#cc88ff' }}>{user?.avatarInitials}</Text>
          </View>
        }
      />

      <View style={{ padding: Spacing.lg }}>
        <SectionTitle title="Configurações da conta" />
        <Card>
          <Input label="Nome completo" value={nome} onChangeText={setNome} placeholder="Seu nome" />
          <Input label="CREF" value={cref} onChangeText={setCref} placeholder="123456-G/SP" autoCapitalize="characters" />
          <Input label="E-mail" value={user?.email || ''} onChangeText={() => {}} placeholder="email@email.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Chave Pix" value={pix} onChangeText={setPix} placeholder="CPF, e-mail ou telefone" />
          <NeonButton label="Salvar alterações" onPress={() => Alert.alert('Salvo!', 'Perfil atualizado com sucesso.')} small />
        </Card>

        <SectionTitle title="Notificações" />
        <Card>
          {[
            { label: 'Pagamentos recebidos', active: true },
            { label: 'Aluno completou treino', active: true },
            { label: 'Vencimento de faturas', active: false },
            { label: 'Novos alunos vinculados', active: true },
          ].map(item => (
            <View key={item.label} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
              <Text style={{ fontSize: 13 }}>{item.label}</Text>
              <View style={{ width: 40, height: 22, borderRadius: 11, backgroundColor: item.active ? Colors.neon : Colors.card2, justifyContent: 'center', paddingHorizontal: 3 }}>
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: item.active ? '#000' : Colors.textSub, alignSelf: item.active ? 'flex-end' : 'flex-start' }} />
              </View>
            </View>
          ))}
        </Card>

        <NeonButton label="Sair da conta" variant="danger" onPress={() => Alert.alert('Sair?', 'Deseja sair?', [{ text: 'Cancelar' }, { text: 'Sair', style: 'destructive', onPress: logout }])} style={{ marginTop: 10 }} />
        <View style={{ height: 30 }} />
      </View>
    </ScrollView>
  );
};
