// src/screens/auth/AuthScreens.tsx
// ─────────────────────────────────────────
// Camis FIT — Auth: Welcome · Login · Cadastro
// ─────────────────────────────────────────
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, StyleSheet,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { NeonButton, Input, Card } from '../../components';
import { useStore } from '../../services/store';

const S = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  logo:   { fontSize: 32, fontWeight: Typography.weights.black, letterSpacing: -1, color: Colors.text },
  tagline:{ fontSize: 13, color: Colors.textSub, marginTop: 6, textAlign: 'center' },
  card:   { backgroundColor: Colors.card, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, padding: Spacing.xl, width: '100%', marginTop: Spacing.xxl },
  row:    { flexDirection: 'row', gap: 8, marginTop: 8 },
  link:   { color: Colors.neon, fontWeight: Typography.weights.bold, fontSize: 12 },
  divLine:{ flex: 1, height: 1, backgroundColor: Colors.border, alignSelf: 'center' },
  divTxt: { fontSize: 11, color: Colors.textSub, marginHorizontal: 10 },
  error:  { fontSize: 11, color: '#ff7a8a', marginTop: 4, marginBottom: 4 },
});

// ── Welcome Screen ─────────────────────
export const WelcomeScreen = ({ navigation }: any) => (
  <View style={[S.screen, S.center]}>
    <View style={{ marginBottom: 40, alignItems: 'center' }}>
      <View style={{ width: 70, height: 70, borderRadius: 22, backgroundColor: Colors.neonDim, borderWidth: 1.5, borderColor: Colors.neonBorder, alignItems: 'center', justifyContent: 'center', marginBottom: 16, ...Shadows.neonSm }}>
        <Text style={{ fontSize: 30 }}>⚡</Text>
      </View>
      <Text style={S.logo}>CAMIS<Text style={{ color: Colors.neon }}>FIT</Text></Text>
      <Text style={S.tagline}>Sua plataforma fitness completa{'\n'}com IA coach personalizada</Text>
    </View>

    <View style={{ width: '100%', gap: 12 }}>
      <NeonButton label="Sou Instrutor / Professor" onPress={() => navigation.navigate('LoginInstrutor')} />
      <NeonButton label="Sou Aluno" onPress={() => navigation.navigate('LoginAluno')} variant="ghost" />
    </View>

    <Text style={{ color: Colors.textSub, fontSize: 11, marginTop: 32, textAlign: 'center' }}>
      Versão 1.0.0 · Camis FIT © 2025
    </Text>
  </View>
);

// ── Login Instrutor ────────────────────
export const LoginInstrutorScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useStore(s => s.setUser);

  const handleLogin = async () => {
    if (!email || !senha) { Alert.alert('Preencha todos os campos'); return; }
    setLoading(true);
    // Demo login — replace with: authAPI.loginInstrutor(email, senha)
    setTimeout(() => {
      setUser({
        id: 'i1', nome: 'Ana Beatriz', email,
        role: 'instrutor', cref: '123456-G/SP',
        codigoConvite: 'ANA-847',
        avatarInitials: 'AB',
      }, 'demo-token-instrutor');
      setLoading(false);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={S.screen}>
      <ScrollView contentContainerStyle={[S.center, { paddingVertical: 60 }]}>
        <Text style={[S.logo, { marginBottom: 4 }]}>CAMIS<Text style={{ color: Colors.neon }}>FIT</Text></Text>
        <Text style={{ fontSize: 12, color: Colors.textSub, marginBottom: 32 }}>Acesso Instrutor</Text>

        <View style={[S.card]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.purple, marginRight: 8 }} />
            <Text style={{ fontSize: 14, fontWeight: Typography.weights.bold, color: '#cc88ff' }}>Área do Instrutor</Text>
          </View>

          <Input label="E-mail" value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Senha" value={senha} onChangeText={setSenha} placeholder="••••••••" secureTextEntry />

          <NeonButton label="Entrar como Instrutor" onPress={handleLogin} loading={loading} style={{ marginTop: 8 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 14 }}>
            <Text style={{ color: Colors.textSub, fontSize: 12 }}>Não tem conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('CadastroInstrutor')}>
              <Text style={S.link}>Cadastrar-se</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: Colors.textSub, fontSize: 12 }}>← Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ── Cadastro Instrutor ─────────────────
export const CadastroInstrutorScreen = ({ navigation }: any) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [cref, setCref] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useStore(s => s.setUser);

  const handleCadastro = async () => {
    if (!nome || !email || !senha || !cref) { Alert.alert('Preencha todos os campos obrigatórios'); return; }
    if (senha !== confirmar) { Alert.alert('As senhas não conferem'); return; }
    setLoading(true);
    // Replace with: authAPI.cadastroInstrutor({ nome, email, senha, cref, telefone })
    setTimeout(() => {
      const codigo = nome.split(' ')[0].toUpperCase().slice(0, 3) + '-' + Math.floor(100 + Math.random() * 900);
      setUser({
        id: 'i-new', nome, email, role: 'instrutor',
        cref, codigoConvite: codigo,
        avatarInitials: nome.slice(0, 2).toUpperCase(),
      }, 'token-novo');
      setLoading(false);
    }, 1200);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={S.screen}>
      <ScrollView contentContainerStyle={{ padding: Spacing.xl, paddingTop: 60 }}>
        <Text style={[S.logo, { marginBottom: 4, textAlign: 'center' }]}>CAMIS<Text style={{ color: Colors.neon }}>FIT</Text></Text>
        <Text style={{ fontSize: 12, color: Colors.textSub, marginBottom: 28, textAlign: 'center' }}>Cadastro de Instrutor</Text>

        <View style={{ backgroundColor: Colors.purpleDim, borderWidth: 1, borderColor: Colors.purple + '50', borderRadius: Radius.md, padding: 12, marginBottom: 20 }}>
          <Text style={{ fontSize: 12, color: '#cc88ff', fontWeight: Typography.weights.bold }}>Acesso Premium de Instrutor</Text>
          <Text style={{ fontSize: 11, color: Colors.textSub, marginTop: 3 }}>Gerencie alunos, treinos, dietas e pagamentos</Text>
        </View>

        <Input label="Nome completo *" value={nome} onChangeText={setNome} placeholder="Prof. Ana Beatriz Santos" />
        <Input label="E-mail *" value={email} onChangeText={setEmail} placeholder="ana@email.com" keyboardType="email-address" autoCapitalize="none" />
        <Input label="CREF *" value={cref} onChangeText={setCref} placeholder="123456-G/SP" autoCapitalize="characters" />
        <Input label="Telefone (WhatsApp)" value={telefone} onChangeText={setTelefone} placeholder="(11) 99999-9999" keyboardType="phone-pad" />
        <Input label="Senha *" value={senha} onChangeText={setSenha} placeholder="Mínimo 8 caracteres" secureTextEntry />
        <Input label="Confirmar senha *" value={confirmar} onChangeText={setConfirmar} placeholder="Repita a senha" secureTextEntry />

        <NeonButton label="Criar conta de Instrutor" onPress={handleCadastro} loading={loading} style={{ marginTop: 8 }} />

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
          <Text style={{ color: Colors.textSub, fontSize: 12 }}>Já tem conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('LoginInstrutor')}>
            <Text style={S.link}>Fazer login</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ── Login Aluno ────────────────────────
export const LoginAlunoScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useStore(s => s.setUser);

  const handleLogin = async () => {
    if (!email || !senha) { Alert.alert('Preencha todos os campos'); return; }
    setLoading(true);
    setTimeout(() => {
      setUser({
        id: 'a1', nome: 'Rafael Silva', email,
        role: 'aluno', instrutorId: 'i1',
        instrutorNome: 'Prof. Ana Beatriz',
        nivel: 7, xp: 620, peso: 78, altura: 175,
        objetivo: 'Hipertrofia', avatarInitials: 'RS',
      }, 'demo-token-aluno');
      setLoading(false);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={S.screen}>
      <ScrollView contentContainerStyle={[S.center, { paddingVertical: 60 }]}>
        <Text style={[S.logo, { marginBottom: 4 }]}>CAMIS<Text style={{ color: Colors.neon }}>FIT</Text></Text>
        <Text style={{ fontSize: 12, color: Colors.textSub, marginBottom: 32 }}>Acesso Aluno</Text>

        <View style={S.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.neon, marginRight: 8 }} />
            <Text style={{ fontSize: 14, fontWeight: Typography.weights.bold, color: Colors.neon }}>Área do Aluno</Text>
          </View>

          <Input label="E-mail" value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Senha" value={senha} onChangeText={setSenha} placeholder="••••••••" secureTextEntry />

          <NeonButton label="Entrar como Aluno" onPress={handleLogin} loading={loading} style={{ marginTop: 8 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 14 }}>
            <Text style={{ color: Colors.textSub, fontSize: 12 }}>Não tem conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('CadastroAluno')}>
              <Text style={S.link}>Cadastrar-se</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: Colors.textSub, fontSize: 12 }}>← Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ── Cadastro Aluno ─────────────────────
export const CadastroAlunoScreen = ({ navigation }: any) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [codigo, setCodigo] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [objetivo, setObjetivo] = useState('Hipertrofia');
  const [loading, setLoading] = useState(false);
  const setUser = useStore(s => s.setUser);

  const objetivos = ['Hipertrofia', 'Emagrecimento', 'Definição', 'Manutenção', 'Saúde geral'];

  const handleCadastro = () => {
    if (!nome || !email || !senha || !codigo) { Alert.alert('Preencha todos os campos'); return; }
    setLoading(true);
    // Replace with: authAPI.cadastroAluno({ nome, email, senha, codigoInstrutor: codigo, peso: +peso, altura: +altura })
    setTimeout(() => {
      setUser({
        id: 'a-new', nome, email, role: 'aluno',
        instrutorId: 'i1', instrutorNome: 'Prof. Ana Beatriz',
        nivel: 1, xp: 0, peso: +peso || 70, altura: +altura || 170,
        objetivo, avatarInitials: nome.slice(0, 2).toUpperCase(),
      }, 'token-novo-aluno');
      setLoading(false);
    }, 1200);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={S.screen}>
      <ScrollView contentContainerStyle={{ padding: Spacing.xl, paddingTop: 60 }}>
        <Text style={[S.logo, { marginBottom: 4, textAlign: 'center' }]}>CAMIS<Text style={{ color: Colors.neon }}>FIT</Text></Text>
        <Text style={{ fontSize: 12, color: Colors.textSub, marginBottom: 24, textAlign: 'center' }}>Cadastro de Aluno</Text>

        {/* Steps indicator */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
          {[1, 2].map(n => (
            <View key={n} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: n <= step ? Colors.neon : Colors.border }} />
          ))}
        </View>

        {step === 1 ? (
          <>
            <Text style={{ fontSize: 15, fontWeight: Typography.weights.bold, color: Colors.text, marginBottom: 16 }}>
              Seus dados
            </Text>
            <Input label="Nome completo *" value={nome} onChangeText={setNome} placeholder="Rafael Silva" />
            <Input label="E-mail *" value={email} onChangeText={setEmail} placeholder="rafael@email.com" keyboardType="email-address" autoCapitalize="none" />
            <Input label="Senha *" value={senha} onChangeText={setSenha} placeholder="Mínimo 8 caracteres" secureTextEntry />

            <View style={{ backgroundColor: Colors.neonDim, borderWidth: 1, borderColor: Colors.neonBorder, borderRadius: Radius.md, padding: 12, marginBottom: 16 }}>
              <Text style={{ fontSize: 12, color: Colors.neon, fontWeight: Typography.weights.bold }}>Código do Instrutor *</Text>
              <Text style={{ fontSize: 11, color: Colors.textSub, marginTop: 2 }}>Seu instrutor vai te passar este código</Text>
            </View>
            <Input label="" value={codigo} onChangeText={v => setCodigo(v.toUpperCase())} placeholder="Ex: ANA-847" autoCapitalize="characters" />

            <NeonButton label="Próximo →" onPress={() => { if (!nome || !email || !senha || !codigo) { Alert.alert('Preencha todos os campos'); return; } setStep(2); }} style={{ marginTop: 8 }} />
          </>
        ) : (
          <>
            <Text style={{ fontSize: 15, fontWeight: Typography.weights.bold, color: Colors.text, marginBottom: 16 }}>
              Seu perfil fitness
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <View style={{ flex: 1 }}><Input label="Peso (kg)" value={peso} onChangeText={setPeso} placeholder="70" keyboardType="numeric" /></View>
              <View style={{ flex: 1 }}><Input label="Altura (cm)" value={altura} onChangeText={setAltura} placeholder="170" keyboardType="numeric" /></View>
            </View>

            <Text style={{ fontSize: 10, fontWeight: Typography.weights.bold, color: Colors.textMid, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              Objetivo principal
            </Text>
            {objetivos.map(o => (
              <TouchableOpacity key={o} onPress={() => setObjetivo(o)} style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: Radius.md, borderWidth: 1, borderColor: o === objetivo ? Colors.neonBorder : Colors.border, backgroundColor: o === objetivo ? Colors.neonDim : Colors.card, marginBottom: 6 }}>
                <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: o === objetivo ? Colors.neon : Colors.textSub, backgroundColor: o === objetivo ? Colors.neon : 'transparent', marginRight: 10 }} />
                <Text style={{ fontSize: 13, color: o === objetivo ? Colors.neon : Colors.text, fontWeight: o === objetivo ? Typography.weights.bold : Typography.weights.regular }}>{o}</Text>
              </TouchableOpacity>
            ))}

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <NeonButton label="← Voltar" onPress={() => setStep(1)} variant="ghost" style={{ flex: 1 }} />
              <NeonButton label="Criar conta" onPress={handleCadastro} loading={loading} style={{ flex: 1 }} />
            </View>
          </>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
          <Text style={{ color: Colors.textSub, fontSize: 12 }}>Já tem conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('LoginAluno')}>
            <Text style={S.link}>Fazer login</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
