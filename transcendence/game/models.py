from django.db import models
from accounts.models import CustomUser

# Create your models here.
class GameInvitation(models.Model):
    from_user = models.ForeignKey(CustomUser, related_name='invitations_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey(CustomUser, related_name='invitations_received', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=10,
        choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')],
        default='pending'
    )

    def __str__(self):
        return f"Invitation de {self.from_user.username} à {self.to_user.username} - {self.status}"