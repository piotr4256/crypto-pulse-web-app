from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MarketListView,
    CoinDetailView,
    CoinMarketChartView,
    ExchangesListView,
    TrendingListView,
    GlobalStatsView,
    UserWatchlistViewSet,
    RegisterAPIView,
    VerifyEmailAPIView,
    CustomTokenObtainPairView,
)

# Router automatycznie tworzy ścieżki dla Twojej bazy (GET, POST, DELETE itp.)
router = DefaultRouter()
router.register(r'watchlist', UserWatchlistViewSet, basename='watchlist')

urlpatterns = [
    # Router musi być podpięty pod pusty string lub konkretną ścieżkę
    path('', include(router.urls)), 
    
    # Autoryzacja
    path('register/', RegisterAPIView.as_view(), name='register'),

    #Weryfikacja emailu
    path('verify-email/', VerifyEmailAPIView.as_view(), name='auth_verify_email'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),

    # Twoje dotychczasowe ścieżki proxy
    path('markets/', MarketListView.as_view(), name='market-list'),
    path('coins/<str:coin_id>/', CoinDetailView.as_view(), name='coin-detail'),
    path('coins/<str:coin_id>/chart/', CoinMarketChartView.as_view(), name='coin-chart'),
    path('exchanges/', ExchangesListView.as_view(), name='exchanges-list'),
    path('trending/', TrendingListView.as_view(), name='trending-list'),
    path('global/', GlobalStatsView.as_view(), name='global-stats'),
]