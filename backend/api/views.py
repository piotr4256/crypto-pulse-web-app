from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import viewsets, generics,status
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiExample
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.core.mail import send_mail
from django.core.signing import TimestampSigner
from django.conf import settings
from django.core.signing import BadSignature, SignatureExpired

from .services import CoinGeckoService
from .models import UserWatchlist
from .serializers import (
    MarketCoinSerializer, 
    CoinDetailSerializer, 
    ExchangeSerializer, 
    TrendingSerializer, 
    GlobalStatsSerializer,
    UserWatchlistSerializer,
    RegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer
)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        # Pobieramy stworzonego usera i generujemy token
        user = User.objects.get(username=response.data["username"])
        #dezaktywujemy konto do momentu aż użytkownik nie potwierdzi drogą mailową potwierdzenia aktywacji
        user.is_active = False
        user.save()
        #generujemu bezpieczny token
        signer = TimestampSigner()
        token = signer.sign(user.username)
        # === WYSYŁANIE MAILA POWITALNEGO Z LINKIEM AKTYWACYJNYM ===
        """ Sprawdzamy, czy użytkownik podał email przy rejestracji """
        if user.email:
            activation_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
            send_mail(
                subject='Witamy w Crypto Pulse!',
                message=f'Cześć {user.username},\n\nDziękujemy za rejestrację w naszej aplikacji! Aby aktywować swoje konto i rozpocząć śledzenie kryptowalut, kliknij w poniższy link:\n\n{activation_url}\n\nLink aktywacyjny jest ważny przez 24 godziny.',
                from_email=None,  # Zostawienie None sprawi, że Django samo weźmie adres z DEFAULT_FROM_EMAIL z settings.py
                recipient_list=[user.email],
                fail_silently=True,  # BARDZO WAŻNE: Jeśli wybuchnie błąd SMTP (np. złe hasło do Gmaila), rejestracja i tak się powiedzie, a serwer nie wyrzuci błędu 500.
            )
        return Response({
            "message": "Rejestracja pomyślna. Sprawdź swoją skrzynkę e-mail, aby aktywować konto."
        }, status=status.HTTP_201_CREATED)

class VerifyEmailAPIView(APIView):
    permission_classes = (AllowAny,)
    def post(self,request):
        token = request.data.get('token')

        if not token:
            return Response({"error": "Brak aktywnego tokenu aktywacyjnego"}, status=status.HTTP_400_BAD_REQUEST)
        signer = TimestampSigner() 

        try:
            username = signer.unsign(token, max_age=86400) # token ważny 24h 
            user = User.objects.get(username=username)
            user.is_active = True
            user.save()
            return Response({"success": "Konto pomyślnie aktywowane", "message": "Konto pomyślnie aktywowane"}, status=status.HTTP_200_OK)

        except (BadSignature, SignatureExpired):
            return Response({"error":"Nieprawidłowy lub wygasły token aktywacyjny"}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error":"Użytkownik nie istnieje"}, status=status.HTTP_404_NOT_FOUND)


class UserWatchlistViewSet(viewsets.ModelViewSet):
    """
    Obsługuje ulubione kryptowaluty użytkowników (Watchlist).
    Tylko zalogowani użytkownicy!
    """
    serializer_class = UserWatchlistSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'coin_id'

    def get_queryset(self):
        return UserWatchlist.objects.filter(user=self.request.user).order_by('-added_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MarketListView(APIView):
    """
    Pobiera listę top 100 kryptowalut.
    """
    @extend_schema(responses=MarketCoinSerializer(many=True))
    def get(self, request):
        data = CoinGeckoService.get_markets()
        if isinstance(data, dict) and 'error' in data:
            return Response(data, status=data.get('status', 500))
            
        serializer = MarketCoinSerializer(data, many=True)
        return Response(serializer.data)

class CoinDetailView(APIView):
    """
    Pobiera szczegółowe dane konkretnej monety.
    """
    @extend_schema(responses=CoinDetailSerializer)
    def get(self, request, coin_id):
        data = CoinGeckoService.get_coin_details(coin_id)   
        if isinstance(data, dict) and 'error' in data:
            return Response(data, status=data.get('status', 500))
            
        serializer = CoinDetailSerializer(data)
        return Response(serializer.data)

class CoinMarketChartView(APIView):
    """
    Pobiera historyczny wykres dla monety (np. z 7 dni).
    Zwracamy surowe dane (prices, market_caps, total_volumes) z uwagi na format wykresów.
    """
    @extend_schema(responses={200: dict})
    def get(self, request, coin_id):
        days = request.query_params.get('days', 7)
        data = CoinGeckoService.get_coin_market_chart(coin_id, days=days)
        if isinstance(data, dict) and 'error' in data:
            return Response(data, status=data.get('status', 500))
            
        return Response(data)

class ExchangesListView(APIView):
    """
    Pobiera listę 100 najpopularniejszych giełd.
    """
    @extend_schema(responses=ExchangeSerializer(many=True))
    def get(self, request):
        data = CoinGeckoService.get_exchanges()
        if isinstance(data, dict) and 'error' in data:
            return Response(data, status=data.get('status', 500))
            
        serializer = ExchangeSerializer(data, many=True)
        return Response(serializer.data)

class TrendingListView(APIView):
    """
    Pobiera listę najczęściej wyszukiwanych monet (trending).
    """
    @extend_schema(responses=TrendingSerializer)
    def get(self, request):
        data = CoinGeckoService.get_trending()   
        if isinstance(data, dict) and 'error' in data:
            return Response(data, status=data.get('status', 500))
            
        serializer = TrendingSerializer(data)
        return Response(serializer.data)

class GlobalStatsView(APIView):
    """
    Pobiera globalne statystyki kryptowalut.
    """
    @extend_schema(responses=GlobalStatsSerializer)
    def get(self, request):
        data = CoinGeckoService.get_global()   
        if isinstance(data, dict) and 'error' in data:
            return Response(data, status=data.get('status', 500))
            
        # Global API zwraca dane wewnątrz klucza 'data'
        global_data = data.get('data', {})
        serializer = GlobalStatsSerializer(global_data)
        return Response(serializer.data)