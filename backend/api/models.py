from django.db import models

from django.contrib.auth import get_user_model

User = get_user_model()

class UserWatchlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watchlist', verbose_name="Użytkownik")
    coin_id = models.CharField(max_length=255, verbose_name="ID Monety (CoinGecko)")
    added_at = models.DateTimeField(auto_now_add=True, verbose_name="Data dodania")

    class Meta:
        verbose_name = "Obserwowana kryptowaluta"
        verbose_name_plural = "Obserwowane kryptowaluty"
        unique_together = ('user', 'coin_id')

    def __str__(self):
        return f"{self.user.username} - {self.coin_id}"
