# Echo_app/urls.py (O ARQUIVO DENTRO DO SEU APP)

from django.urls import path, reverse_lazy
from django.contrib.auth import views as auth_views 
from . import views 
from .views import NoticiaDetalheView 

app_name = "Echo_app"

urlpatterns = [
    # Autenticação e Perfil
    path("entrar/", views.entrar, name="entrar"),
    path("registrar/", views.registrar, name="registrar"),
    path("sair/", views.sair, name="sair"),
    path("excluir-conta/", views.excluir_conta, name="excluir_conta"),
    path("perfil/", views.perfil_detalhe, name="perfil"),
    path("perfil/editar/", views.perfil_editar, name="perfil_editar"),
    path("perfil/configuracoes/", views.configuracoes_conta, name="configuracoes_conta"),
    
    # 🌟 FLUXO DE REDEFINIÇÃO DE SENHA (Customizado para Código OTP) 🌟
    
    # 1. Solicitação de E-mail (USA A VIEW CUSTOMIZADA que envia o código OTP)
    path('esqueci-senha/', views.iniciar_redefinicao_otp, name='esqueci_senha'), # <--- ALTERADO!

    # 2. Rota para Verificação do Código OTP (CUSTOMIZADA - Renderiza codigo.html)
    path('verificar-codigo/', views.verificar_codigo, name='verificar_codigo'),

    # 3. Rota para Reenviar o Código (CUSTOMIZADA)
    path('reenviar-codigo/', views.reenviar_codigo, name='reenviar_codigo'),

    # 4. Rota de Confirmação (Link no E-mail) - Recebe UID e Token
    path('reset/<uidb64>/<token>/', 
         auth_views.PasswordResetConfirmView.as_view(
             template_name='Echo_app/senha_redefinir.html', 
             # Redireciona para a conclusão, onde o popup será exibido.
             success_url=reverse_lazy('Echo_app:password_reset_complete')
         ), 
         name='password_reset_confirm'),

    # 5. Conclusão da Redefinição (Template com popup e redirecionamento JS)
    path('reset/concluido/', 
         auth_views.PasswordResetCompleteView.as_view(
             template_name='Echo_app/senha_concluida.html' 
         ), 
         name='password_reset_complete'),
    
    # ✅ Página Principal
    path("", views.dashboard, name="dashboard"),

    # Notícias (Criação e Interação)
    path("criar-noticia/", views.criar_noticia, name="criar_noticia"),
    path("noticia/<int:pk>/", NoticiaDetalheView.as_view(), name="noticia_detalhe"),
    path("noticia/<int:noticia_id>/curtir/", views.curtir_noticia, name="noticia_curtir"),
    path("noticia/<int:noticia_id>/salvar/", views.salvar_noticia, name="noticia_salvar"),

    # Notificações
    path('notificacoes/', views.lista_notificacoes, name='lista_notificacoes'),
    path('notificacoes/<int:notificacao_id>/marcar_lida/', views.marcar_notificacao_lida, name='marcar_notificacao_lida'),
    path('notificacoes/marcar_todas_lidas/', views.marcar_todas_lidas, name='marcar_todas_lidas'),

    # URL da API interna (AJAX para o filtro do dashboard)
    path('filtrar-noticias/', views.filtrar_noticias, name='filtrar_noticias'),
    
    # URL para pesquisa de notícias
    path('pesquisar/', views.pesquisar_noticias, name='pesquisar_noticias'),

    path('curtidas/', views.noticias_curtidas, name='noticias_curtidas'),
    path('salvos/', views.noticias_salvas_view, name='noticias_salvas'),
]